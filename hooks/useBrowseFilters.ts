"use client";

import { browseDebug } from "@/lib/browse/debug";
import {
  resolveBrowseFilterDestination,
  resolveCurrentBrowseUrl,
} from "@/lib/browse/browse-filter-navigation";
import {
  clearSavedBrowseFilters,
  isBareBrowseUrl,
  loadSavedBrowseFilters,
  persistBrowseFilters,
} from "@/lib/browse/filter-persistence";
import {
  DEFAULT_BROWSE_FILTERS,
  filtersAreEqual,
  parseBrowseFilters,
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

      const destination = resolveBrowseFilterDestination(next);
      const current = resolveCurrentBrowseUrl(pathname, searchParams);
      if (destination === current) {
        return;
      }

      browseDebug("Filters applied to URL", {
        providerIds: next.providerIds,
        from: current,
        to: destination,
        filters: next,
        scrollToTop: options?.scrollToTop ?? false,
      });
      router.replace(destination, { scroll: false });
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

    const destination = resolveBrowseFilterDestination(filters);
    const current = resolveCurrentBrowseUrl(pathname, searchParams);
    if (destination !== current) {
      browseDebug("Migrating legacy home browse URL", { from: current, to: destination });
      router.replace(destination, { scroll: false });
      return;
    }

    if (!isBareBrowseUrl(searchParams)) return;

    const saved = loadSavedBrowseFilters();
    if (saved && !filtersAreEqual(saved, filters)) {
      setFilters(saved);
    }
  }, [pathname, searchParams, filters, router, setFilters]);

  const clearFilters = useCallback(() => {
    clearSavedBrowseFilters();
    setFilters(DEFAULT_BROWSE_FILTERS, { scrollToTop: true });
  }, [setFilters]);

  return { filters, setFilters, commitBrowseFilters, clearFilters };
}
