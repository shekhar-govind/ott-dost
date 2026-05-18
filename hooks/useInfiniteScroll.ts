"use client";

import { useEffect, useRef } from "react";

interface UseInfiniteScrollOptions {
  enabled: boolean;
  hasMore: boolean;
  isLoading: boolean;
  /** Only observe when the list has items (avoids fetch loops on empty short pages). */
  canObserve: boolean;
  onLoadMore: () => void;
}

export function useInfiniteScroll({
  enabled,
  hasMore,
  isLoading,
  canObserve,
  onLoadMore,
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const onLoadMoreRef = useRef(onLoadMore);
  const enabledRef = useRef(enabled);
  const hasMoreRef = useRef(hasMore);
  const isLoadingRef = useRef(isLoading);
  const canObserveRef = useRef(canObserve);

  onLoadMoreRef.current = onLoadMore;
  enabledRef.current = enabled;
  hasMoreRef.current = hasMore;
  isLoadingRef.current = isLoading;
  canObserveRef.current = canObserve;

  useEffect(() => {
    if (!enabled || !canObserve) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        if (!enabledRef.current || !hasMoreRef.current || !canObserveRef.current) return;
        if (isLoadingRef.current) return;

        onLoadMoreRef.current();
      },
      { root: null, rootMargin: "0px", threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [enabled, canObserve]);

  return sentinelRef;
}
