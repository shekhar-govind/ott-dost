"use client";

import { fetchBrowsePage } from "@/lib/api/browse";
import { browseDebug } from "@/lib/browse/debug";
import { shouldDeferBrowseRestore } from "@/lib/browse/should-defer-browse-restore";
import { mergeBrowseItems } from "@/lib/browse/items";
import type { BrowseFilters } from "@/lib/browse/filters";
import { serializeBrowseFilters } from "@/lib/browse/filters";
import {
  clearBrowseListSnapshot,
  loadBrowseListSnapshot,
  saveBrowseListSnapshot,
  type BrowseListSnapshot,
} from "@/lib/browse/browse-restore-snapshot";
import type { BrowsePage, SearchTitle } from "@/lib/tmdb/types";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

const MAX_CONSECUTIVE_EMPTY_BROWSE_PAGES = 20;

interface UseBrowseListOptions {
  infiniteScroll: boolean;
  filters: BrowseFilters;
  /** Skip ISR HTML and fetch client-side (saved filter restore on bare `/`). */
  deferInitialData?: boolean;
  /** Hold off on filter-key resync until saved filters are on the URL. */
  pauseFetching?: boolean;
  initialPage?: BrowsePage | null;
  initialFilterKey?: string | null;
}

interface UseBrowseListResult {
  items: SearchTitle[];
  page: number;
  totalPages: number;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  setPage: (page: number) => void;
  loadMore: () => void;
  refresh: () => void;
}

export function useBrowseList({
  infiniteScroll,
  filters,
  deferInitialData = false,
  pauseFetching = false,
  initialPage = null,
  initialFilterKey = null,
}: UseBrowseListOptions): UseBrowseListResult {
  const filterKey = useMemo(() => serializeBrowseFilters(filters), [filters]);

  // A prior in-session snapshot for this exact filter, if any. Held in state so
  // it's read once. We do NOT seed rendered state from it directly (that would
  // cause a hydration mismatch); instead a layout effect applies it pre-paint.
  const [restoredSnapshot] = useState<BrowseListSnapshot | null>(() => {
    if (typeof window !== "undefined" && shouldDeferBrowseRestore(window.location.search)) {
      return null;
    }
    return loadBrowseListSnapshot(filterKey);
  });

  const [items, setItems] = useState<SearchTitle[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emptyPageStreak, setEmptyPageStreak] = useState(0);

  /** Filter key the current `items` were fetched with. */
  const syncedFilterKeyRef = useRef<string | null>(
    restoredSnapshot ? filterKey : null,
  );
  const loadedPageRef = useRef(restoredSnapshot?.loadedPage ?? 0);
  const abortRef = useRef<AbortController | null>(null);
  const initialPageAppliedRef = useRef(restoredSnapshot != null);
  const snapshotAppliedRef = useRef(false);

  const cancelInFlight = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const applyBrowsePage = useCallback(
    (
      data: Awaited<ReturnType<typeof fetchBrowsePage>>,
      mode: "replace" | "append",
      activeFilterKey: string,
    ) => {
      loadedPageRef.current = data.page;
      setPage(data.page);
      setTotalPages(data.totalPages);
      syncedFilterKeyRef.current = activeFilterKey;

      const receivedCount = data.items.length;
      setEmptyPageStreak((prevStreak) => {
        const nextEmptyStreak =
          mode === "append"
            ? receivedCount === 0
              ? prevStreak + 1
              : 0
            : receivedCount === 0
              ? 1
              : 0;
        setHasMore(
          data.hasMore && nextEmptyStreak < MAX_CONSECUTIVE_EMPTY_BROWSE_PAGES,
        );
        return nextEmptyStreak;
      });

      setItems((prev) => {
        const nextItems =
          mode === "append" ? mergeBrowseItems(prev, data.items) : data.items;
        browseDebug("Browse list synced to filters", {
          mode,
          page: data.page,
          filterKey: activeFilterKey,
          itemCount: nextItems.length,
        });
        return nextItems;
      });
    },
    [],
  );

  const fetchPage = useCallback(
    async (
      targetPage: number,
      mode: "replace" | "append",
      activeFilterKey: string,
      activeFilters: BrowseFilters,
    ) => {
      cancelInFlight();
      const controller = new AbortController();
      abortRef.current = controller;

      const isAppend = mode === "append";
      if (isAppend) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
        setError(null);
      }

      try {
        const data = await fetchBrowsePage(
          targetPage,
          activeFilters,
          controller.signal,
        );

        if (controller.signal.aborted) return;

        applyBrowsePage(data, mode, activeFilterKey);
      } catch (fetchError) {
        if (controller.signal.aborted) return;
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          return;
        }
        setError("Could not load titles. Try again.");
        if (!isAppend) {
          setItems([]);
          syncedFilterKeyRef.current = null;
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
      }
    },
    [applyBrowsePage, cancelInFlight],
  );

  /**
   * Restore a saved snapshot before paint. Rendered state starts at defaults
   * (matching SSR), and this layout effect fills it in before the browser
   * paints, so there's no hydration mismatch and no visible flash. The refs
   * were already seeded above so the resync/initial-page effects treat the
   * list as already synced and skip refetching.
   */
  useLayoutEffect(() => {
    if (snapshotAppliedRef.current) return;
    snapshotAppliedRef.current = true;
    if (!restoredSnapshot) return;
    setItems(restoredSnapshot.items);
    setPage(restoredSnapshot.page);
    setTotalPages(restoredSnapshot.totalPages);
    setHasMore(restoredSnapshot.hasMore);
    setEmptyPageStreak(restoredSnapshot.emptyPageStreak);
  }, [restoredSnapshot]);

  /** Persist the synced list so back-navigation can restore it this session. */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (syncedFilterKeyRef.current !== filterKey) return;
    if (items.length === 0) return;
    saveBrowseListSnapshot({
      filterKey,
      items,
      loadedPage: loadedPageRef.current,
      page,
      totalPages,
      hasMore,
      emptyPageStreak,
    });
  }, [items, page, totalPages, hasMore, emptyPageStreak, filterKey]);

  /** Apply ISR page 1 from props before paint when server HTML is present. */
  useLayoutEffect(() => {
    if (deferInitialData || initialPageAppliedRef.current) return;
    if (!initialPage || initialFilterKey !== filterKey) return;
    if (syncedFilterKeyRef.current === filterKey) return;

    initialPageAppliedRef.current = true;
    applyBrowsePage(initialPage, "replace", filterKey);
    setIsLoading(false);
  }, [deferInitialData, initialPage, initialFilterKey, filterKey, applyBrowsePage]);

  /** Keep list aligned with URL filters whenever the filter key changes on home. */
  useEffect(() => {
    if (pauseFetching) return;
    if (syncedFilterKeyRef.current === filterKey) return;

    browseDebug("Browse list resync (filter key changed)", {
      from: syncedFilterKeyRef.current,
      to: filterKey,
    });

    setPage(1);
    loadedPageRef.current = 0;
    setEmptyPageStreak(0);
    setHasMore(false);
    setItems([]);
    initialPageAppliedRef.current = false;

    void fetchPage(1, "replace", filterKey, filters);
  }, [filterKey, filters, fetchPage, pauseFetching]);

  /** Desktop pagination — only when list is already synced to current filters. */
  useEffect(() => {
    if (infiniteScroll || page <= 1) return;
    if (syncedFilterKeyRef.current !== filterKey) return;
    if (page === loadedPageRef.current) return;

    void fetchPage(page, "replace", filterKey, filters);
  }, [infiniteScroll, page, filterKey, filters, fetchPage]);

  const loadMore = useCallback(() => {
    if (
      !infiniteScroll ||
      !hasMore ||
      isLoading ||
      isLoadingMore ||
      syncedFilterKeyRef.current !== filterKey
    ) {
      return;
    }

    void fetchPage(loadedPageRef.current + 1, "append", filterKey, filters);
  }, [
    infiniteScroll,
    hasMore,
    isLoading,
    isLoadingMore,
    filterKey,
    filters,
    fetchPage,
  ]);

  const refresh = useCallback(() => {
    clearBrowseListSnapshot();
    syncedFilterKeyRef.current = null;
    initialPageAppliedRef.current = false;
    setPage(1);
    loadedPageRef.current = 0;
    setItems([]);
    void fetchPage(1, "replace", filterKey, filters);
  }, [filterKey, filters, fetchPage]);

  const setPageSafe = useCallback((nextPage: number) => {
    if (syncedFilterKeyRef.current !== filterKey) return;
    setPage(nextPage);
  }, [filterKey]);

  return {
    items,
    page,
    totalPages,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    setPage: setPageSafe,
    loadMore,
    refresh,
  };
}
