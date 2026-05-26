"use client";

import { fetchBrowseWatchProviders } from "@/lib/api/browse";
import { browseItemKey } from "@/lib/browse/items";
import {
  getCachedWatchProvidersBatch,
  setCachedWatchProvidersBatch,
} from "@/lib/browse/stream-providers-cache";
import type { BrowseWatchProviderEntry } from "@/lib/browse/watch-provider-entry";
import {
  logWatchProvidersScrollSettled,
  recordWatchProvidersCacheSkipped,
  resetWatchProvidersFetchLog,
} from "@/lib/browse/watch-providers-log";
import type { SearchTitle, StreamingProvider } from "@/lib/tmdb/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDebouncedValue } from "./useDebouncedValue";

const VISIBILITY_BUFFER_BELOW = 5;
const MAX_BATCH_SIZE = 25;
/** Debounce network batches while scrolling; enqueue stays immediate. */
export const BROWSE_STREAM_FETCH_DEBOUNCE_MS = 120;

export type BrowseStreamLoadState = "pending" | "loaded" | "error";

interface UseBrowseStreamProvidersOptions {
  enabled: boolean;
  items: SearchTitle[];
  /** Clears provider cache when browse filters change. */
  filterCacheKey: string;
}

interface UseBrowseStreamProvidersResult {
  getProviders: (key: string) => StreamingProvider[] | undefined;
  getHasRentOrBuy: (key: string) => boolean | undefined;
  getLoadState: (key: string) => BrowseStreamLoadState;
  /** Queued or actively fetching (not yet loaded). */
  isStreamLoading: (key: string) => boolean;
  retryStreamProviders: (item: Pick<SearchTitle, "id" | "mediaType">) => void;
  registerItemElement: (key: string, element: HTMLElement | null) => void;
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function chunkArray<T>(values: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }
  return chunks;
}

/** Keys to fetch when `anchorKey` enters the viewport (+buffer below). */
export function keysToFetchForAnchor(
  items: SearchTitle[],
  anchorKey: string,
): string[] {
  const anchorIndex = items.findIndex(
    (item) => browseItemKey(item) === anchorKey,
  );
  if (anchorIndex < 0) return [];

  const endIndex = Math.min(
    anchorIndex + VISIBILITY_BUFFER_BELOW,
    items.length - 1,
  );

  const keys: string[] = [];
  for (let index = anchorIndex; index <= endIndex; index += 1) {
    keys.push(browseItemKey(items[index]));
  }

  return keys;
}

export function mergeFetchKeys(
  queued: Set<string>,
  items: SearchTitle[],
  anchorKeys: Iterable<string>,
): void {
  for (const anchorKey of anchorKeys) {
    for (const key of keysToFetchForAnchor(items, anchorKey)) {
      queued.add(key);
    }
  }
}

export function useBrowseStreamProviders({
  enabled,
  items,
  filterCacheKey,
}: UseBrowseStreamProvidersOptions): UseBrowseStreamProvidersResult {
  const [providersByKey, setProvidersByKey] = useState<
    Record<string, StreamingProvider[]>
  >({});
  const [hasRentOrBuyByKey, setHasRentOrBuyByKey] = useState<
    Record<string, boolean>
  >({});
  const [loadedKeys, setLoadedKeys] = useState<Set<string>>(() => new Set());
  const [errorKeys, setErrorKeys] = useState<Set<string>>(() => new Set());
  const [queueRevision, setQueueRevision] = useState(0);
  const [inFlightRevision, setInFlightRevision] = useState(0);

  const queuedKeysRef = useRef<Set<string>>(new Set());
  const inFlightKeysRef = useRef<Set<string>>(new Set());
  const loadedKeysRef = useRef(loadedKeys);
  const errorKeysRef = useRef(errorKeys);
  const fetchGenerationRef = useRef(0);
  const elementByKeyRef = useRef<Map<string, HTMLElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const itemsRef = useRef(items);
  const isProcessingRef = useRef(false);
  const needsAnotherPassRef = useRef(false);

  loadedKeysRef.current = loadedKeys;
  errorKeysRef.current = errorKeys;
  itemsRef.current = items;

  const markKeysError = useCallback((keys: string[]) => {
    if (keys.length === 0) return;

    for (const key of keys) {
      errorKeysRef.current.add(key);
      loadedKeysRef.current.delete(key);
      queuedKeysRef.current.delete(key);
    }

    setProvidersByKey((prev) => {
      const next = { ...prev };
      for (const key of keys) {
        delete next[key];
      }
      return next;
    });

    setLoadedKeys((prev) => {
      const next = new Set(prev);
      for (const key of keys) {
        next.delete(key);
      }
      return next;
    });

    setErrorKeys((prev) => {
      const next = new Set(prev);
      for (const key of keys) {
        next.add(key);
      }
      return next;
    });
  }, []);

  const applyLoadedProviders = useCallback(
    (updates: Record<string, BrowseWatchProviderEntry>) => {
      const keys = Object.keys(updates);
      if (keys.length === 0) return;

      const providerUpdates: Record<string, StreamingProvider[]> = {};
      const rentOrBuyUpdates: Record<string, boolean> = {};

      for (const key of keys) {
        providerUpdates[key] = updates[key].providers ?? [];
        rentOrBuyUpdates[key] = updates[key].hasRentOrBuy ?? false;
      }

      setProvidersByKey((prev) => ({ ...prev, ...providerUpdates }));
      setHasRentOrBuyByKey((prev) => ({ ...prev, ...rentOrBuyUpdates }));

      for (const key of keys) {
        loadedKeysRef.current.add(key);
        errorKeysRef.current.delete(key);
        queuedKeysRef.current.delete(key);
      }

      setLoadedKeys((prev) => {
        const next = new Set(prev);
        for (const key of keys) {
          next.add(key);
        }
        return next;
      });

      setErrorKeys((prev) => {
        const next = new Set(prev);
        for (const key of keys) {
          next.delete(key);
        }
        return next;
      });
    },
    [],
  );

  const enqueueKeys = useCallback(
    (keys: Iterable<string>) => {
      const candidates = [...keys].filter(
        (key) =>
          !loadedKeysRef.current.has(key) && !errorKeysRef.current.has(key),
      );
      if (candidates.length === 0) return;

      const cached = getCachedWatchProvidersBatch(candidates);
      const cacheUpdates: Record<string, BrowseWatchProviderEntry> = {};
      const misses: string[] = [];

      for (const key of candidates) {
        if (cached.has(key)) {
          cacheUpdates[key] = cached.get(key)!;
        } else {
          misses.push(key);
        }
      }

      if (Object.keys(cacheUpdates).length > 0) {
        recordWatchProvidersCacheSkipped(Object.keys(cacheUpdates).length);
        applyLoadedProviders(cacheUpdates);
      }

      const queue = queuedKeysRef.current;
      const added: string[] = [];

      for (const key of misses) {
        if (!queue.has(key)) {
          queue.add(key);
          added.push(key);
        }
      }

      if (Object.keys(cacheUpdates).length > 0 || added.length > 0) {
        setQueueRevision((revision) => revision + 1);
      }
    },
    [applyLoadedProviders],
  );

  const enqueueForAnchors = useCallback(
    (anchorKeys: Iterable<string>) => {
      const next = new Set<string>();
      mergeFetchKeys(next, itemsRef.current, anchorKeys);
      enqueueKeys(next);
    },
    [enqueueKeys],
  );

  const syncVisibleFromLayout = useCallback(() => {
    const inView: string[] = [];

    for (const [key, element] of elementByKeyRef.current) {
      const rect = element.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        inView.push(key);
      }
    }

    if (inView.length > 0) {
      enqueueForAnchors(inView);
    }
  }, [enqueueForAnchors]);

  useEffect(() => {
    fetchGenerationRef.current += 1;
    inFlightKeysRef.current.clear();
    queuedKeysRef.current.clear();
    setProvidersByKey({});
    setHasRentOrBuyByKey({});
    setLoadedKeys(new Set());
    setErrorKeys(new Set());
    setQueueRevision(0);
    resetWatchProvidersFetchLog();
  }, [filterCacheKey]);

  useEffect(() => {
    if (!enabled) {
      queuedKeysRef.current.clear();
      setQueueRevision(0);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entered: string[] = [];

        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const key = entry.target.getAttribute("data-browse-key");
          if (key) entered.push(key);
        }

        if (entered.length > 0) {
          enqueueForAnchors(entered);
        }
      },
      { root: null, threshold: 0 },
    );

    observerRef.current = observer;

    for (const element of elementByKeyRef.current.values()) {
      observer.observe(element);
    }

    syncVisibleFromLayout();

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [enabled, enqueueForAnchors, syncVisibleFromLayout]);

  useEffect(() => {
    if (!enabled) return;
    syncVisibleFromLayout();
  }, [enabled, items.length, syncVisibleFromLayout]);

  const pendingKeys = useMemo(() => {
    return [...queuedKeysRef.current].filter(
      (key) =>
        !loadedKeys.has(key) && !inFlightKeysRef.current.has(key),
    );
    // queueRevision + loadedKeys drive recomputation when queue or loads change
  }, [queueRevision, loadedKeys]);

  const debouncedScrollActivity = useDebouncedValue(
    queueRevision,
    BROWSE_STREAM_FETCH_DEBOUNCE_MS,
  );

  const bumpInFlightRevision = useCallback(() => {
    setInFlightRevision((revision) => revision + 1);
  }, []);

  useEffect(() => {
    if (!enabled || debouncedScrollActivity < 1) return;

    const generation = fetchGenerationRef.current;

    const getPendingKeys = () =>
      [...queuedKeysRef.current].filter(
        (key) =>
          !loadedKeysRef.current.has(key) && !inFlightKeysRef.current.has(key),
      );

    const processPending = async () => {
      const keys = getPendingKeys();
      const chunks = chunkArray(keys, MAX_BATCH_SIZE);

      for (const [, chunkKeys] of chunks.entries()) {
        if (generation !== fetchGenerationRef.current) return;

        const chunk = chunkKeys.filter(
          (key) =>
            !loadedKeysRef.current.has(key) && !inFlightKeysRef.current.has(key),
        );

        if (chunk.length === 0) continue;

        for (const key of chunk) {
          inFlightKeysRef.current.add(key);
        }
        bumpInFlightRevision();

        const batchItems = chunk
          .map((key) =>
            itemsRef.current.find((item) => browseItemKey(item) === key),
          )
          .filter((item): item is SearchTitle => item !== undefined)
          .map((item) => ({ id: item.id, mediaType: item.mediaType }));

        try {
          const { entries } = await fetchBrowseWatchProviders(batchItems);

          if (generation !== fetchGenerationRef.current) return;

          const updates: Record<string, BrowseWatchProviderEntry> = {
            ...entries,
          };
          for (const key of chunk) {
            if (!(key in updates)) {
              updates[key] = { providers: [], hasRentOrBuy: false };
            }
          }

          applyLoadedProviders(updates);
          setCachedWatchProvidersBatch(updates);
        } catch (error) {
          if (generation !== fetchGenerationRef.current) return;
          if (isAbortError(error)) return;

          markKeysError(chunk);
        } finally {
          for (const key of chunk) {
            inFlightKeysRef.current.delete(key);
          }
          bumpInFlightRevision();
        }
      }
    };

    const run = async () => {
      if (isProcessingRef.current) {
        needsAnotherPassRef.current = true;
        return;
      }

      isProcessingRef.current = true;

      do {
        needsAnotherPassRef.current = false;
        await processPending();
      } while (
        generation === fetchGenerationRef.current &&
        (needsAnotherPassRef.current || getPendingKeys().length > 0)
      );

      isProcessingRef.current = false;

      if (
        needsAnotherPassRef.current &&
        generation === fetchGenerationRef.current
      ) {
        void run();
      }
    };

    const pendingCount = getPendingKeys().length;
    logWatchProvidersScrollSettled(pendingCount);

    if (pendingCount > 0) {
      void run();
    }
  }, [
    enabled,
    debouncedScrollActivity,
    bumpInFlightRevision,
    applyLoadedProviders,
    markKeysError,
  ]);

  const retryStreamProviders = useCallback(
    (item: Pick<SearchTitle, "id" | "mediaType">) => {
      const key = browseItemKey(item);
      if (inFlightKeysRef.current.has(key)) return;

      errorKeysRef.current.delete(key);
      setErrorKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });

      inFlightKeysRef.current.add(key);
      bumpInFlightRevision();

      void fetchBrowseWatchProviders([{ id: item.id, mediaType: item.mediaType }])
        .then(({ entries }) => {
          const entry = entries[key] ?? { providers: [], hasRentOrBuy: false };
          const updates = { [key]: entry };
          applyLoadedProviders(updates);
          setCachedWatchProvidersBatch(updates);
        })
        .catch(() => {
          markKeysError([key]);
        })
        .finally(() => {
          inFlightKeysRef.current.delete(key);
          bumpInFlightRevision();
        });
    },
    [applyLoadedProviders, bumpInFlightRevision, markKeysError],
  );

  const isStreamLoading = useCallback(
    (key: string) => {
      if (loadedKeys.has(key)) return false;
      if (errorKeys.has(key)) {
        return inFlightKeysRef.current.has(key);
      }
      return (
        queuedKeysRef.current.has(key) || inFlightKeysRef.current.has(key)
      );
    },
    [loadedKeys, errorKeys, queueRevision, inFlightRevision],
  );

  const getProviders = useCallback(
    (key: string): StreamingProvider[] | undefined => {
      if (!loadedKeys.has(key)) return undefined;
      return providersByKey[key] ?? [];
    },
    [providersByKey, loadedKeys],
  );

  const getHasRentOrBuy = useCallback(
    (key: string): boolean | undefined => {
      if (!loadedKeys.has(key)) return undefined;
      return hasRentOrBuyByKey[key] ?? false;
    },
    [hasRentOrBuyByKey, loadedKeys],
  );

  const getLoadState = useCallback(
    (key: string): BrowseStreamLoadState => {
      if (loadedKeys.has(key)) return "loaded";
      if (errorKeys.has(key)) return "error";
      return "pending";
    },
    [loadedKeys, errorKeys],
  );

  const registerItemElement = useCallback(
    (key: string, element: HTMLElement | null) => {
      const observer = observerRef.current;
      const previous = elementByKeyRef.current.get(key);

      if (previous && observer) {
        observer.unobserve(previous);
        elementByKeyRef.current.delete(key);
      }

      if (!element) return;

      elementByKeyRef.current.set(key, element);
      observer?.observe(element);

      requestAnimationFrame(() => {
        syncVisibleFromLayout();
      });
    },
    [syncVisibleFromLayout],
  );

  return {
    getProviders,
    getHasRentOrBuy,
    getLoadState,
    isStreamLoading,
    retryStreamProviders,
    registerItemElement,
  };
}
