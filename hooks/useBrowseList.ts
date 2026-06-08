"use client";

import { fetchBrowsePage } from "@/lib/api/browse";
import { browseDebug } from "@/lib/browse/debug";
import { consumeHomeBrowseSeed } from "@/lib/browse/home-browse-seed";
import { mergeBrowseItems } from "@/lib/browse/items";
import type { BrowseFilters } from "@/lib/browse/filters";
import { serializeBrowseFilters } from "@/lib/browse/filters";
import { hasPendingBackNavigation } from "@/lib/navigation/back-navigation";
import type { SearchTitle } from "@/lib/tmdb/types";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

const MAX_CONSECUTIVE_EMPTY_BROWSE_PAGES = 20;

interface UseBrowseListOptions {
  enabled: boolean;
  /** When true, disabling does not clear list state (e.g. navigating away from home). */
  preserveStateWhenDisabled?: boolean;
  infiniteScroll: boolean;
  filters: BrowseFilters;
  /** Skip server HTML and fetch client-side (saved filter restore on bare `/`). */
  deferInitialData?: boolean;
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
  enabled,
  preserveStateWhenDisabled = false,
  infiniteScroll,
  filters,
  deferInitialData = false,
}: UseBrowseListOptions): UseBrowseListResult {
  const filterKey = useMemo(() => serializeBrowseFilters(filters), [filters]);

  const [items, setItems] = useState<SearchTitle[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emptyPageStreak, setEmptyPageStreak] = useState(0);

  /** Filter key the current `items` were fetched with. */
  const syncedFilterKeyRef = useRef<string | null>(null);
  const loadedPageRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const seedAppliedRef = useRef(false);

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

  /** Apply ISR seed before paint when landing on home (not when restoring preserved state). */
  useLayoutEffect(() => {
    if (!enabled || deferInitialData || seedAppliedRef.current) return;
    if (hasPendingBackNavigation()) return;
    if (syncedFilterKeyRef.current === filterKey) return;

    const seed = consumeHomeBrowseSeed();
    if (!seed || seed.initialFilterKey !== filterKey) return;

    seedAppliedRef.current = true;
    applyBrowsePage(seed.initialPage, "replace", filterKey);
    setIsLoading(false);
  }, [enabled, deferInitialData, filterKey, applyBrowsePage]);

  /** Keep list aligned with URL filters whenever the filter key changes on home. */
  useEffect(() => {
    if (!enabled) return;

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

    void fetchPage(1, "replace", filterKey, filters);
  }, [enabled, filterKey, filters, fetchPage]);

  /** Desktop pagination — only when list is already synced to current filters. */
  useEffect(() => {
    if (!enabled || infiniteScroll || page <= 1) return;
    if (syncedFilterKeyRef.current !== filterKey) return;
    if (page === loadedPageRef.current) return;

    void fetchPage(page, "replace", filterKey, filters);
  }, [enabled, infiniteScroll, page, filterKey, filters, fetchPage]);

  useEffect(() => {
    if (enabled) return;

    cancelInFlight();
    setIsLoading(false);
    setIsLoadingMore(false);

    if (!preserveStateWhenDisabled) {
      setItems([]);
      setPage(1);
      loadedPageRef.current = 0;
      setError(null);
      setEmptyPageStreak(0);
      setHasMore(false);
      syncedFilterKeyRef.current = null;
      seedAppliedRef.current = false;
    }
  }, [enabled, preserveStateWhenDisabled, cancelInFlight]);

  const loadMore = useCallback(() => {
    if (
      !enabled ||
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
    enabled,
    infiniteScroll,
    hasMore,
    isLoading,
    isLoadingMore,
    filterKey,
    filters,
    fetchPage,
  ]);

  const refresh = useCallback(() => {
    if (!enabled) return;

    syncedFilterKeyRef.current = null;
    seedAppliedRef.current = false;
    setPage(1);
    loadedPageRef.current = 0;
    setItems([]);
    void fetchPage(1, "replace", filterKey, filters);
  }, [enabled, filterKey, filters, fetchPage]);

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
