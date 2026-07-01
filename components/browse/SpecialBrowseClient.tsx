"use client";

import { useBrowseFilterMeta } from "@/hooks/useBrowseFilterMeta";
import { useBrowseList } from "@/hooks/useBrowseList";
import { useSpecialBrowseFilters } from "@/hooks/useSpecialBrowseFilters";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  filtersAreEqual,
  hasNonDefaultBrowseFilters,
  serializeBrowseFilters,
} from "@/lib/browse/filters";
import { buildSpecialBrowseListTitle } from "@/lib/browse/special-page-metadata";
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
import { specialBrowseRefinementQueryEquals } from "@/hooks/useSpecialBrowseFilters";

interface SpecialBrowseClientProps {
  pathname: string;
  initialPage: BrowsePage | null;
  initialFilterKey: string | null;
  hasServerList: boolean;
}

export function SpecialBrowseClient({
  pathname,
  initialPage,
  initialFilterKey,
  hasServerList,
}: SpecialBrowseClientProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [showClientBrowse, setShowClientBrowse] = useState(() => !hasServerList);
  const { filters, setFilters, commitBrowseFilters, clearFilters } =
    useSpecialBrowseFilters(pathname);
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
    const needsSanitize = !filtersAreEqual(sanitized, filters);
    const needsUrlSync = !specialBrowseRefinementQueryEquals(
      pathname,
      sanitized,
      searchParams.toString(),
    );

    if (needsSanitize || needsUrlSync) {
      setFilters(sanitized);
    }
  }, [filters, meta, pathname, searchParams, setFilters]);

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

  const didRestoreScrollRef = useRef(false);
  useEffect(() => {
    if (didRestoreScrollRef.current) return;
    if (!showClientBrowse || items.length === 0) return;
    didRestoreScrollRef.current = true;
    const targetY = loadBrowseScroll(browseScrollKey);
    if (targetY == null || targetY <= 0) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => window.scrollTo(0, targetY));
    });
  }, [showClientBrowse, items.length, browseScrollKey]);

  const filtersActive = hasNonDefaultBrowseFilters(filters);
  const streamFilterCacheKey = useMemo(
    () => serializeBrowseFilters(filters),
    [filters],
  );

  const browseListTitle = buildSpecialBrowseListTitle(filters, pathname);
  const pageHeading = browseListTitle;

  return (
    <>
      <h1 className="sr-only">{pageHeading}</h1>
      <section
        data-browse-list
        className={`mt-4 w-full ${showClientBrowse ? "" : "hidden"}`}
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
          <h2 className="text-sm font-semibold tracking-tight text-zinc-900">
            {browseListTitle}
          </h2>
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

        {!isDesktop && (
          <>
            <div ref={sentinelRef} className="h-px w-full shrink-0" aria-hidden />
            {isLoadingMore && (
              <p className="mt-4 text-center text-sm text-zinc-500">Loading more…</p>
            )}
            {!hasMore && items.length > 0 && (
              <p className="mt-4 text-center text-sm text-zinc-400">
                You&apos;ve reached the end
              </p>
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
    </>
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
