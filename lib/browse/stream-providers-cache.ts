import type { BrowseWatchProviderEntry } from "@/lib/browse/watch-provider-entry";

export const WATCH_PROVIDERS_CACHE_STORAGE_KEY = "ott-dost:watch-providers";
export const WATCH_PROVIDERS_CACHE_MAX_ENTRIES = 200;
export const WATCH_PROVIDERS_CACHE_MAX_BYTES = 512 * 1024;
export const WATCH_PROVIDERS_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const CACHE_VERSION = 3;

interface WatchProvidersCacheEntry extends BrowseWatchProviderEntry {
  fetchedAt: number;
  expiresAt: number;
}

interface WatchProvidersCacheStore {
  v: number;
  entries: Record<string, WatchProvidersCacheEntry>;
}

let memoryStore: WatchProvidersCacheStore | null = null;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function emptyStore(): WatchProvidersCacheStore {
  return { v: CACHE_VERSION, entries: {} };
}

function serializeStore(store: WatchProvidersCacheStore): string {
  return JSON.stringify(store);
}

function byteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

function loadStoreFromDisk(): WatchProvidersCacheStore {
  if (!isBrowser()) return emptyStore();

  try {
    const raw = localStorage.getItem(WATCH_PROVIDERS_CACHE_STORAGE_KEY);
    if (!raw) return emptyStore();

    const parsed = JSON.parse(raw) as WatchProvidersCacheStore;
    if (parsed?.v !== CACHE_VERSION || !parsed.entries) {
      return emptyStore();
    }

    return parsed;
  } catch {
    return emptyStore();
  }
}

function readStore(): WatchProvidersCacheStore {
  if (!memoryStore) {
    memoryStore = loadStoreFromDisk();
  }
  return memoryStore;
}

function writeStore(store: WatchProvidersCacheStore): void {
  memoryStore = store;
  if (!isBrowser()) return;

  try {
    localStorage.setItem(WATCH_PROVIDERS_CACHE_STORAGE_KEY, serializeStore(store));
  } catch (error) {
    if (!isQuotaExceeded(error)) return;

    const entries = Object.entries(store.entries).sort(
      ([, a], [, b]) => a.fetchedAt - b.fetchedAt,
    );
    const trimCount = Math.max(1, Math.ceil(entries.length * 0.25));

    for (let index = 0; index < trimCount; index += 1) {
      delete store.entries[entries[index][0]];
    }

    try {
      localStorage.setItem(WATCH_PROVIDERS_CACHE_STORAGE_KEY, serializeStore(store));
    } catch {
      memoryStore = emptyStore();
      try {
        localStorage.removeItem(WATCH_PROVIDERS_CACHE_STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  }
}

function isQuotaExceeded(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === "QuotaExceededError" || error.code === 22)
  );
}

function pruneExpiredEntries(store: WatchProvidersCacheStore, now: number): void {
  for (const [key, entry] of Object.entries(store.entries)) {
    if (entry.expiresAt <= now) {
      delete store.entries[key];
    }
  }
}

function enforceLimits(store: WatchProvidersCacheStore): void {
  const entries = Object.entries(store.entries).sort(
    ([, a], [, b]) => a.fetchedAt - b.fetchedAt,
  );

  let serialized = serializeStore(store);

  while (
    entries.length > WATCH_PROVIDERS_CACHE_MAX_ENTRIES ||
    byteLength(serialized) > WATCH_PROVIDERS_CACHE_MAX_BYTES
  ) {
    const oldest = entries.shift();
    if (!oldest) break;
    delete store.entries[oldest[0]];
    serialized = serializeStore(store);
  }
}

/** Read valid cached watch-provider entries for keys (misses omitted). */
export function getCachedWatchProvidersBatch(
  keys: string[],
): Map<string, BrowseWatchProviderEntry> {
  const hits = new Map<string, BrowseWatchProviderEntry>();
  if (keys.length === 0 || !isBrowser()) return hits;

  const now = Date.now();
  const store = readStore();
  pruneExpiredEntries(store, now);

  for (const key of keys) {
    const entry = store.entries[key];
    if (!entry || entry.expiresAt <= now) continue;
    hits.set(key, {
      providers: entry.providers ?? [],
      hasRentOrBuy: entry.hasRentOrBuy ?? false,
    });
  }

  writeStore(store);
  return hits;
}

/** Persist providers for titles (empty arrays are stored). */
export function setCachedWatchProvidersBatch(
  entries: Record<string, BrowseWatchProviderEntry>,
): void {
  const keys = Object.keys(entries);
  if (keys.length === 0 || !isBrowser()) return;

  const now = Date.now();
  const store = readStore();
  pruneExpiredEntries(store, now);

  for (const key of keys) {
    const entry = entries[key];
    store.entries[key] = {
      providers: entry.providers,
      hasRentOrBuy: entry.hasRentOrBuy,
      fetchedAt: now,
      expiresAt: now + WATCH_PROVIDERS_CACHE_TTL_MS,
    };
  }

  enforceLimits(store);
  writeStore(store);
}

export function getWatchProvidersCacheStats(): {
  entryCount: number;
  byteSize: number;
} {
  const store = readStore();
  const serialized = serializeStore(store);
  return {
    entryCount: Object.keys(store.entries).length,
    byteSize: byteLength(serialized),
  };
}
