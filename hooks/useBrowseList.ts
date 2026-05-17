"use client";

import { fetchBrowsePage } from "@/lib/api/browse";
import type { SearchTitle } from "@/lib/tmdb/types";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseBrowseListOptions {
  enabled: boolean;
  infiniteScroll: boolean;
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
  infiniteScroll,
}: UseBrowseListOptions): UseBrowseListResult {
  const [items, setItems] = useState<SearchTitle[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

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
        const data = await fetchBrowsePage(targetPage);

        if (currentRequest !== requestId.current) return;

        setPage(data.page);
        setTotalPages(data.totalPages);
        setHasMore(data.hasMore);
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
      setItems([]);
      setPage(1);
      setError(null);
      setIsLoading(false);
      setIsLoadingMore(false);
      return;
    }

    loadPage(1, "replace");
  }, [enabled, loadPage]);

  useEffect(() => {
    if (!enabled || infiniteScroll || page === 1) return;
    loadPage(page, "replace");
  }, [enabled, infiniteScroll, page, loadPage]);

  const loadMore = useCallback(() => {
    if (!enabled || !infiniteScroll || isLoading || isLoadingMore || !hasMore) {
      return;
    }
    loadPage(page + 1, "append");
  }, [
    enabled,
    hasMore,
    infiniteScroll,
    isLoading,
    isLoadingMore,
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
