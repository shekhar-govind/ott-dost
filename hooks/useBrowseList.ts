"use client";

import { fetchBrowsePage } from "@/lib/api/browse";
import { browseDebug } from "@/lib/browse/debug";
import { mergeBrowseItems } from "@/lib/browse/items";
import type { BrowseFilters } from "@/lib/browse/filters";
import { filtersAreEqual } from "@/lib/browse/filters";
import type { SearchTitle } from "@/lib/tmdb/types";
import { useCallback, useEffect, useRef, useState } from "react";
const MAX_CONSECUTIVE_EMPTY_BROWSE_PAGES = 20;

interface UseBrowseListOptions {
  enabled: boolean;
  /** When true, disabling does not clear list state (e.g. navigating away from home). */
  preserveStateWhenDisabled?: boolean;
  infiniteScroll: boolean;
  filters: BrowseFilters;
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
}: UseBrowseListOptions): UseBrowseListResult {
  const [items, setItems] = useState<SearchTitle[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emptyPageStreak, setEmptyPageStreak] = useState(0);
  const requestId = useRef(0);
  const filtersRef = useRef(filters);
  const prevFiltersRef = useRef(filters);
  const hasLoadedRef = useRef(false);
  const loadedPageRef = useRef(0);
  const inFlightRef = useRef(false);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const resetPagination = useCallback(() => {
    requestId.current += 1;
    inFlightRef.current = false;
    loadedPageRef.current = 0;
    setPage(1);
    setTotalPages(1);
    setHasMore(false);
    setEmptyPageStreak(0);
    setItems([]);
    setError(null);
    setIsLoading(false);
    setIsLoadingMore(false);
    browseDebug("Browse pagination reset (filters changed)", {
      page: 1,
      providerIds: filtersRef.current.providerIds,
    });
  }, []);

  const loadPage = useCallback(
    async (targetPage: number, mode: "replace" | "append") => {
      if (inFlightRef.current && mode === "append") return;
      if (inFlightRef.current && mode === "replace") {
        requestId.current += 1;
        inFlightRef.current = false;
      }
      if (mode === "append" && targetPage <= loadedPageRef.current) return;

      const currentRequest = ++requestId.current;
      const isAppend = mode === "append";
      inFlightRef.current = true;

      if (isAppend) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const data = await fetchBrowsePage(targetPage, filtersRef.current);

        if (currentRequest !== requestId.current) return;

        loadedPageRef.current = data.page;
        setPage(data.page);
        setTotalPages(data.totalPages);

        const receivedCount = data.items.length;
        setEmptyPageStreak((prevStreak) => {
          const nextEmptyStreak = isAppend
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
          const nextItems = isAppend
            ? mergeBrowseItems(prev, data.items)
            : data.items;
          browseDebug("Browse list state updated", {
            mode: isAppend ? "append" : "replace",
            page: data.page,
            providerIds: filtersRef.current.providerIds,
            itemCount: nextItems.length,
          });
          return nextItems;
        });
      } catch {
        if (currentRequest !== requestId.current) return;
        setError("Could not load titles. Try again.");
        if (!isAppend) setItems([]);
      } finally {
        inFlightRef.current = false;
        if (currentRequest === requestId.current) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [],
  );

  const appendNextPage = useCallback(() => {
    if (!enabled || !infiniteScroll || inFlightRef.current || !hasMore) return;
    loadPage(loadedPageRef.current + 1, "append");
  }, [enabled, hasMore, infiniteScroll, loadPage]);

  const refresh = useCallback(() => {
    if (!enabled) return;
    resetPagination();
    loadPage(1, "replace");
  }, [enabled, loadPage, resetPagination]);

  useEffect(() => {
    if (!enabled) {
      if (!preserveStateWhenDisabled) {
        setItems([]);
        setPage(1);
        loadedPageRef.current = 0;
        setError(null);
        setIsLoading(false);
        setIsLoadingMore(false);
        setEmptyPageStreak(0);
        hasLoadedRef.current = false;
      }
      return;
    }

    const filtersChanged = !filtersAreEqual(prevFiltersRef.current, filters);
    prevFiltersRef.current = filters;

    if (filtersChanged) {
      resetPagination();
      hasLoadedRef.current = true;
      loadPage(1, "replace");
      return;
    }

    if (preserveStateWhenDisabled && hasLoadedRef.current) {
      return;
    }

    hasLoadedRef.current = true;
    loadPage(1, "replace");
  }, [enabled, filters, preserveStateWhenDisabled, loadPage, resetPagination]);

  useEffect(() => {
    if (!enabled || infiniteScroll || page === 1) return;
    loadPage(page, "replace");
  }, [enabled, infiniteScroll, page, loadPage]);

  const loadMore = useCallback(() => {
    appendNextPage();
  }, [appendNextPage]);

  return {
    items,
    page,
    totalPages,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    setPage,
    loadMore,
    refresh,
  };
}
