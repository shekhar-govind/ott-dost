"use client";

import { useBrowseList } from "@/hooks/useBrowseList";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { SearchTitle } from "@/lib/tmdb/types";
import { BrowseListItem } from "./BrowseListItem";
import { BrowsePagination } from "./BrowsePagination";

interface BrowseListProps {
  enabled: boolean;
  onSelect: (item: SearchTitle) => void;
}

export function BrowseList({ enabled, onSelect }: BrowseListProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const {
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
  } = useBrowseList({
    enabled,
    infiniteScroll: !isDesktop,
  });

  const sentinelRef = useInfiniteScroll({
    enabled: enabled && !isDesktop,
    hasMore,
    isLoading: isLoading || isLoadingMore,
    onLoadMore: loadMore,
  });

  if (!enabled) return null;

  return (
    <section className="mt-8 w-full" aria-label="Latest movies in English, Hindi, and Malayalam">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-zinc-900">
            Latest movies
          </h3>
          <p className="mt-0.5 text-xs text-zinc-500">English · Hindi · Malayalam</p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={isLoading}
          className="shrink-0 text-xs font-medium text-zinc-500 transition hover:text-zinc-800 disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {isLoading && items.length === 0 ? (
        <BrowseListSkeleton />
      ) : items.length === 0 ? (
        <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-500">
          No titles with OTT availability on this page. Try the next page.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <BrowseListItem
              key={`${item.mediaType}-${item.id}`}
              item={item}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}

      {!isDesktop && (
        <>
          <div ref={sentinelRef} className="h-1 w-full" aria-hidden />
          {isLoadingMore && (
            <p className="mt-4 text-center text-sm text-zinc-500">Loading more…</p>
          )}
          {!hasMore && items.length > 0 && (
            <p className="mt-4 text-center text-sm text-zinc-400">You&apos;ve reached the end</p>
          )}
        </>
      )}

      {isDesktop && (
        <BrowsePagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          disabled={isLoading}
        />
      )}
    </section>
  );
}

function BrowseListSkeleton() {
  return (
    <ul className="space-y-2" aria-hidden>
      {Array.from({ length: 5 }).map((_, index) => (
        <li
          key={index}
          className="h-16 animate-pulse rounded-xl border border-zinc-200 bg-zinc-100"
        />
      ))}
    </ul>
  );
}
