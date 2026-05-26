"use client";

import { browseDebug } from "@/lib/browse/debug";
import {
  clearSavedBrowseFilters,
  isBareBrowseUrl,
  loadSavedBrowseFilters,
  persistBrowseFilters,
} from "@/lib/browse/filter-persistence";
import {
  browseFilterQueryEquals,
  DEFAULT_BROWSE_FILTERS,
  filtersAreEqual,
  parseBrowseFilters,
  serializeBrowseFilters,
  type BrowseFilters,
} from "@/lib/browse/filters";
import { scrollRouteToTop } from "@/lib/route-scroll";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";

export interface SetBrowseFiltersOptions {
  scrollToTop?: boolean;
}

export function useBrowseFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(
    () => parseBrowseFilters(searchParams),
    [searchParams],
  );

  useEffect(() => {
    browseDebug("Filters parsed from URL", {
      providerIds: filters.providerIds,
      ottFromUrl: searchParams.get("ott"),
      filters,
    });
  }, [filters, searchParams]);

  const setFilters = useCallback(
    (next: BrowseFilters, options?: SetBrowseFiltersOptions) => {
      if (pathname !== "/") return;

      const query = serializeBrowseFilters(next);
      const currentQuery = searchParams.toString();
      if (browseFilterQueryEquals(query, currentQuery)) {
        return;
      }

      browseDebug("Filters applied to URL", {
        providerIds: next.providerIds,
        serializedOttParam: next.providerIds.length > 0 ? next.providerIds.join(",") : null,
        fullQuery: query || null,
        filters: next,
        scrollToTop: options?.scrollToTop ?? false,
      });
      router.replace(query ? `/?${query}` : "/", { scroll: false });
      if (options?.scrollToTop) {
        scrollRouteToTop();
      }
    },
    [pathname, router, searchParams],
  );

  /** Apply filters and remember them — only for explicit user actions. */
  const commitBrowseFilters = useCallback(
    (next: BrowseFilters) => {
      persistBrowseFilters(next);
      setFilters(next, { scrollToTop: true });
    },
    [setFilters],
  );

  useEffect(() => {
    if (pathname !== "/") return;
    if (!isBareBrowseUrl(searchParams)) return;

    const saved = loadSavedBrowseFilters();
    if (saved && !filtersAreEqual(saved, filters)) {
      setFilters(saved);
    }
  }, [pathname, searchParams, filters, setFilters]);

  const clearFilters = useCallback(() => {
    clearSavedBrowseFilters();
    setFilters(DEFAULT_BROWSE_FILTERS, { scrollToTop: true });
  }, [setFilters]);

  return { filters, setFilters, commitBrowseFilters, clearFilters };
}
