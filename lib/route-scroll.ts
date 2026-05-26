/** One sessionStorage entry; route → scroll Y inside the JSON object. */
const SCROLL_STORE_KEY = "ott-dost:scroll-by-route";

const LEGACY_KEY_PREFIXES = ["ott-dost:scroll-y:", "ott-dost:scroll:"] as const;

type ScrollStore = Record<string, number>;

/** In-memory map after first load; avoids re-scanning sessionStorage on every save. */
let scrollStoreCache: ScrollStore | null = null;

/**
 * Canonical route identity for scroll storage.
 * Title pages use /movie/{id} or /tv/{id} (slug is cosmetic and may redirect).
 */
export function normalizeRouteUrl(urlOrPath: string): string {
  const withoutHash = urlOrPath.split("#")[0] || "/";

  if (typeof window === "undefined") {
    return withoutHash || "/";
  }

  try {
    const parsed = new URL(withoutHash, window.location.origin);
    let pathname = parsed.pathname || "/";
    if (pathname.length > 1 && pathname.endsWith("/")) {
      pathname = pathname.slice(0, -1);
    }

    const titleMatch = pathname.match(/^\/(movie|tv)\/(\d+)(?:\/.*)?$/);
    if (titleMatch) {
      return `/${titleMatch[1]}/${titleMatch[2]}`;
    }

    return pathname + parsed.search;
  } catch {
    return withoutHash || "/";
  }
}

export function getRouteUrl(): string {
  if (typeof window === "undefined") return "/";
  return normalizeRouteUrl(
    window.location.pathname + window.location.search,
  );
}

function readStore(): ScrollStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(SCROLL_STORE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    return parsed as ScrollStore;
  } catch {
    return {};
  }
}

function writeStore(store: ScrollStore): void {
  sessionStorage.setItem(SCROLL_STORE_KEY, JSON.stringify(store));
}

/** Remove legacy per-URL sessionStorage keys from earlier implementations. */
export function clearLegacyScrollKeys(): void {
  if (typeof window === "undefined") return;
  for (let i = sessionStorage.length - 1; i >= 0; i -= 1) {
    const key = sessionStorage.key(i);
    if (!key) continue;
    if (LEGACY_KEY_PREFIXES.some((prefix) => key.startsWith(prefix))) {
      sessionStorage.removeItem(key);
    }
  }
}

function migrateLegacyKeysIntoStore(store: ScrollStore): ScrollStore {
  if (typeof window === "undefined") return store;
  const next = { ...store };

  for (let i = sessionStorage.length - 1; i >= 0; i -= 1) {
    const key = sessionStorage.key(i);
    if (!key) continue;
    const prefix = LEGACY_KEY_PREFIXES.find((p) => key.startsWith(p));
    if (!prefix) continue;

    const routePart = key.slice(prefix.length);
    const route = normalizeRouteUrl(routePart);
    const raw = sessionStorage.getItem(key);
    sessionStorage.removeItem(key);
    if (raw == null) continue;

    const y = Number(raw);
    if (!Number.isFinite(y) || y < 0) continue;
    next[route] = y;
  }

  return next;
}

function readScrollY(): number {
  if (typeof window === "undefined") return 0;
  const root = document.scrollingElement ?? document.documentElement;
  return Math.max(
    window.scrollY,
    window.pageYOffset,
    root.scrollTop,
    document.body.scrollTop,
  );
}

/** Full load: parse store, merge legacy keys, remove legacy keys. Call once per session tab. */
function loadStoreWithMigration(): ScrollStore {
  const store = migrateLegacyKeysIntoStore(readStore());
  clearLegacyScrollKeys();
  return store;
}

function getScrollStoreForMutation(): ScrollStore {
  if (scrollStoreCache) return scrollStoreCache;
  scrollStoreCache = loadStoreWithMigration();
  return scrollStoreCache;
}

/** Run once on app load: merge legacy keys into the single store. */
export function initRouteScrollStorage(): void {
  if (typeof window === "undefined") return;
  scrollStoreCache = loadStoreWithMigration();
  writeStore(scrollStoreCache);
}

/**
 * Persist scroll Y for a route. If `scrollY` is omitted, reads the live document position.
 */
export function saveRouteScrollPosition(
  routeUrl?: string,
  scrollY?: number,
): void {
  if (typeof window === "undefined") return;

  const route = normalizeRouteUrl(routeUrl ?? getRouteUrl());
  const y = scrollY !== undefined ? scrollY : readScrollY();

  const store = getScrollStoreForMutation();
  store[route] = y;
  writeStore(store);
}

export function readRouteScrollPosition(routeUrl: string): number | null {
  const route = normalizeRouteUrl(routeUrl);
  const store = getScrollStoreForMutation();
  const y = store[route];
  if (y == null || !Number.isFinite(y) || y < 0) return null;
  return y;
}

export function readSavedRouteScroll(routeUrl?: string): number | null {
  const route = normalizeRouteUrl(routeUrl ?? getRouteUrl());
  return readRouteScrollPosition(route);
}

export function restoreRouteScrollPixel(y: number): void {
  window.scrollTo(0, y);

  const root = document.scrollingElement;
  if (root) {
    root.scrollTop = y;
  }
  document.documentElement.scrollTop = y;
  document.body.scrollTop = y;
}

/** Scroll the document to the top (e.g. after filter URL replace). */
export function scrollRouteToTop(): void {
  restoreRouteScrollPixel(0);
}

/**
 * Restore scroll for a route from sessionStorage (read-only).
 * Returns a cancel function for in-flight restore, or null if nothing saved.
 */
export function restoreSavedRouteScroll(routeUrl: string): (() => void) | null {
  const y = readSavedRouteScroll(routeUrl);
  if (y == null) return null;

  const cancelRaf = restoreRouteScrollWhenLayoutReady(y);
  const timeoutId = window.setTimeout(() => {
    const maxScroll = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight,
    );
    restoreRouteScrollPixel(Math.min(y, maxScroll));
  }, 100);

  return () => {
    cancelRaf();
    clearTimeout(timeoutId);
  };
}

export function restoreRouteScrollWhenLayoutReady(
  targetY: number,
  maxWaitMs = 4000,
): () => void {
  const start = performance.now();
  let raf = 0;

  const tick = () => {
    const el = document.documentElement;
    const maxScroll = Math.max(0, el.scrollHeight - window.innerHeight);
    const y = Math.min(Math.max(0, targetY), maxScroll);
    restoreRouteScrollPixel(y);

    const tallEnough = maxScroll >= targetY - 1;
    const timedOut = performance.now() - start > maxWaitMs;

    if (!tallEnough && !timedOut) {
      raf = requestAnimationFrame(tick);
    }
  };

  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}
