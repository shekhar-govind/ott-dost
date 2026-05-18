"use client";

import { fetchBrowsePage } from "@/lib/api/browse";
import type { BrowseFilters } from "@/lib/browse/filters";
import { filtersAreEqual } from "@/lib/browse/filters";
import type { SearchTitle } from "@/lib/tmdb/types";
import { useCallback, useEffect, useRef, useState } from "react";

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
  const requestId = useRef(0);
  const filtersRef = useRef(filters);
  const prevFiltersRef = useRef(filters);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const loadPage = useCallback(
    async (targetPage: number, mode: "replace" | "append") => {
      const currentRequest = ++requestId.current;
      const isAppend = mode === "append";

      if (isAppend) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const data = await fetchBrowsePage(targetPage, filtersRef.current);

        if (currentRequest !== requestId.current) return;

        setPage(data.page);
        setTotalPages(data.totalPages);
        const appendedNothing = isAppend && data.items.length === 0;
        setHasMore(appendedNothing ? false : data.hasMore);
        setItems((prev) =>
          isAppend ? [...prev, ...data.items] : data.items,
        );
      } catch {
        if (currentRequest !== requestId.current) return;
        setError("Could not load titles. Try again.");
        if (!isAppend) setItems([]);
      } finally {
        if (currentRequest === requestId.current) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [],
  );

  const refresh = useCallback(() => {
    if (!enabled) return;
    setPage(1);
    loadPage(1, "replace");
  }, [enabled, loadPage]);

  useEffect(() => {
    if (!enabled) {
      if (!preserveStateWhenDisabled) {
        setItems([]);
        setPage(1);
        setError(null);
        setIsLoading(false);
        setIsLoadingMore(false);
        hasLoadedRef.current = false;
      }
      return;
    }

    const filtersChanged = !filtersAreEqual(prevFiltersRef.current, filters);
    prevFiltersRef.current = filters;

    if (filtersChanged) {
      setPage(1);
      hasLoadedRef.current = true;
      loadPage(1, "replace");
      return;
    }

    if (preserveStateWhenDisabled && hasLoadedRef.current) {
      return;
    }

    hasLoadedRef.current = true;
    loadPage(1, "replace");
  }, [enabled, filters, preserveStateWhenDisabled, loadPage]);

  useEffect(() => {
    if (!enabled || infiniteScroll || page === 1) return;
    loadPage(page, "replace");
  }, [enabled, infiniteScroll, page, loadPage]);

  const loadMore = useCallback(() => {
    if (
      !enabled ||
      !infiniteScroll ||
      isLoading ||
      isLoadingMore ||
      !hasMore ||
      items.length === 0
    ) {
      return;
    }
    loadPage(page + 1, "append");
  }, [
    enabled,
    hasMore,
    infiniteScroll,
    isLoading,
    isLoadingMore,
    items.length,
    loadPage,
    page,
  ]);

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
