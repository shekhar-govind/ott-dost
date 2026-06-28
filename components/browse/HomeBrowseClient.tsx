"use client";

import { useBrowseFilterMeta } from "@/hooks/useBrowseFilterMeta";
import { useBrowseFilters } from "@/hooks/useBrowseFilters";
import { useBrowseList } from "@/hooks/useBrowseList";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { persistBrowseFilters } from "@/lib/browse/filter-persistence";
import {
  browseFilterQueryEquals,
  filtersAreEqual,
  hasNonDefaultBrowseFilters,
  serializeBrowseFilters,
} from "@/lib/browse/filters";
import { shouldDeferBrowseRestore } from "@/lib/browse/should-defer-browse-restore";
import {
  loadBrowseScroll,
  saveBrowseScroll,
} from "@/lib/browse/browse-restore-snapshot";
import { browseItemKey } from "@/lib/browse/items";
import type { BrowsePage } from "@/lib/tmdb/types";
import { useSearchParams } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { sanitizeBrowseFiltersForMediaType } from "./filters/browse-filter-utils";
import { BrowseFilterSheet } from "./filters/BrowseFilterSheet";
import { BrowseFiltersToolbar } from "./filters/BrowseFiltersToolbar";
import { BrowseStreamProvidersProvider } from "./BrowseStreamProvidersContext";
import { BrowseListItem } from "./BrowseListItem";
import { BrowsePagination } from "./BrowsePagination";

interface HomeBrowseClientProps {
  initialPage: BrowsePage | null;
  initialFilterKey: string | null;
  /** True when ISR server list HTML is in the document (hidden until hydration). */
  hasServerList: boolean;
}

export function HomeBrowseClient({
  initialPage,
  initialFilterKey,
  hasServerList,
}: HomeBrowseClientProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [showClientBrowse, setShowClientBrowse] = useState(() => !hasServerList);
  const [deferInitialData] = useState(() => {
    if (typeof window === "undefined") return false;
    return shouldDeferBrowseRestore(window.location.search);
  });
  const { filters, setFilters, commitBrowseFilters, clearFilters } =
    useBrowseFilters();
  const searchParams = useSearchParams();
  const { meta } = useBrowseFilterMeta(true);

  useLayoutEffect(() => {
    if (!hasServerList) return;
    document.documentElement.classList.add("home-browse-hydrated");
    setShowClientBrowse(true);
    return () => {
      document.documentElement.classList.remove("home-browse-hydrated");
    };
  }, [hasServerList]);

  useEffect(() => {
    const metaLoaded =
      meta.movieGenres.length > 0 ||
      meta.tvGenres.length > 0 ||
      meta.movieProviders.length > 0 ||
      meta.tvProviders.length > 0;
    if (!metaLoaded) return;

    const sanitized = sanitizeBrowseFiltersForMediaType(filters, meta);
    const canonicalQuery = serializeBrowseFilters(sanitized);
    const needsSanitize = !filtersAreEqual(sanitized, filters);
    const needsUrlSync = !browseFilterQueryEquals(
      canonicalQuery,
      searchParams.toString(),
    );

    if (needsSanitize) {
      persistBrowseFilters(sanitized);
      setFilters(sanitized);
    } else if (needsUrlSync) {
      setFilters(sanitized);
    }
  }, [filters, meta, searchParams, setFilters]);

  useEffect(() => {
    if (!deferInitialData) return;
    document.documentElement.classList.remove("browse-restore-pending");
  }, [deferInitialData]);

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
    infiniteScroll: !isDesktop,
    filters,
    deferInitialData,
    initialPage,
    initialFilterKey,
  });

  const sentinelRef = useInfiniteScroll({
    enabled: !isDesktop,
    hasMore,
    isLoading: isLoading || isLoadingMore,
    canObserve: items.length > 0,
    onLoadMore: loadMore,
  });

  const browseScrollKey = useMemo(
    () => serializeBrowseFilters(filters),
    [filters],
  );

  // Persist scroll position (throttled) so back-navigation can return to it.
  useEffect(() => {
    let lastWrite = 0;
    const save = () => saveBrowseScroll(browseScrollKey, window.scrollY);
    const onScroll = () => {
      const now = Date.now();
      if (now - lastWrite < 150) return;
      lastWrite = now;
      save();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", save);
    document.addEventListener("visibilitychange", save);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", save);
      document.removeEventListener("visibilitychange", save);
    };
  }, [browseScrollKey]);

  // Restore scroll once the list is visible and populated (back-navigation).
  const didRestoreScrollRef = useRef(false);
  useEffect(() => {
    if (didRestoreScrollRef.current) return;
    if (!showClientBrowse || items.length === 0) return;
    didRestoreScrollRef.current = true;
    const targetY = loadBrowseScroll(browseScrollKey);
    if (targetY == null || targetY <= 0) return;
    // Wait two frames so the list (and fixed-size poster rows) have laid out
    // and we override any router scroll-to-top before painting.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => window.scrollTo(0, targetY));
    });
  }, [showClientBrowse, items.length, browseScrollKey]);

  const filtersActive = hasNonDefaultBrowseFilters(filters);
  const streamFilterCacheKey = useMemo(
    () => serializeBrowseFilters(filters),
    [filters],
  );

  const browseListTitle =
    filters.mediaType === "tv" ? "Browse TV shows" : "Browse movies";

  return (
    <section
      data-browse-list
      className={`mt-8 w-full ${showClientBrowse ? "" : "hidden"}`}
      aria-label={browseListTitle}
    >
      <BrowseFiltersToolbar
        filters={filters}
        meta={meta}
        filtersSheetOpen={sheetOpen}
        onOpenFilters={() => setSheetOpen(true)}
        onFiltersChange={commitBrowseFilters}
        onClearFilters={clearFilters}
      />

      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold tracking-tight text-zinc-900">
          {browseListTitle}
        </h3>
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
        <p
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}

      {isLoading && items.length === 0 ? (
        <BrowseListSkeleton />
      ) : items.length === 0 ? (
        <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-500">
          {filtersActive
            ? "No titles match your filters. Try clearing filters or adjusting your selection."
            : "No titles with OTT availability on this page."}
        </p>
      ) : (
        <BrowseStreamProvidersProvider
          enabled
          items={items}
          filterCacheKey={streamFilterCacheKey}
        >
          <div data-server-browse-items>
            <ul className="space-y-1.5">
              {items.map((item) => (
                <BrowseListItem key={browseItemKey(item)} item={item} />
              ))}
            </ul>
          </div>
        </BrowseStreamProvidersProvider>
      )}

      <div data-browse-restore-skeleton className="browse-restore-skeleton">
        <BrowseListSkeleton />
      </div>

      {!isDesktop && (
        <>
          <div ref={sentinelRef} className="h-px w-full shrink-0" aria-hidden />
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

      <BrowseFilterSheet
        open={sheetOpen}
        appliedFilters={filters}
        meta={meta}
        onClose={() => setSheetOpen(false)}
        onApply={commitBrowseFilters}
      />
    </section>
  );
}

function BrowseListSkeleton() {
  return (
    <ul className="space-y-1.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, index) => (
        <li
          key={index}
          className="min-h-[6.5rem] animate-pulse rounded-lg border border-zinc-100 bg-zinc-100"
        />
      ))}
    </ul>
  );
}
