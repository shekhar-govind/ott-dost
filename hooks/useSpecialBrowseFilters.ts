"use client";

import { browseDebug } from "@/lib/browse/debug";
import {
  resolveBrowseFilterDestination,
  resolveCurrentBrowseUrl,
} from "@/lib/browse/browse-filter-navigation";
import {
  clearSavedBrowseFilters,
  persistBrowseFilters,
} from "@/lib/browse/filter-persistence";
import type { BrowseFilters } from "@/lib/browse/filters";
import { buildBrowseSpecialPagePath } from "@/lib/browse/path-facets";
import {
  parseSpecialPageFilters,
  serializeSpecialPageRefinements,
} from "@/lib/browse/special-page-filters";
import { browseFilterQueryEquals } from "@/lib/browse/filters";
import { scrollRouteToTop } from "@/lib/route-scroll";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import type { SetBrowseFiltersOptions } from "@/hooks/useBrowseFilters";

export function useSpecialBrowseFilters(pathname: string) {
  const router = useRouter();
  const currentPathname = usePathname();
  const searchParams = useSearchParams();

  const activePathname = currentPathname === pathname ? currentPathname : pathname;

  const filters = useMemo(() => {
    const parsed = parseSpecialPageFilters(activePathname, searchParams);
    if (parsed) return parsed;
    return parseSpecialPageFilters(pathname, new URLSearchParams());
  }, [activePathname, pathname, searchParams]);

  useEffect(() => {
    if (!filters) return;
    browseDebug("Special page filters", { pathname: activePathname, filters });
  }, [filters, activePathname]);

  const setFilters = useCallback(
    (next: BrowseFilters, options?: SetBrowseFiltersOptions) => {
      const destination = resolveBrowseFilterDestination(next);
      const current = resolveCurrentBrowseUrl(activePathname, searchParams);

      if (destination === current) return;

      browseDebug("Special page filters applied", {
        from: current,
        to: destination,
        filters: next,
      });

      router.replace(destination, { scroll: false });
      if (options?.scrollToTop) {
        scrollRouteToTop();
      }
    },
    [activePathname, router, searchParams],
  );

  const commitBrowseFilters = useCallback(
    (next: BrowseFilters) => {
      persistBrowseFilters(next);
      setFilters(next, { scrollToTop: true });
    },
    [setFilters],
  );

  const clearFilters = useCallback(() => {
    if (!filters) return;
    clearSavedBrowseFilters();
    const destination = buildBrowseSpecialPagePath(filters);
    router.replace(destination, { scroll: false });
    scrollRouteToTop();
  }, [filters, router]);

  if (!filters) {
    throw new Error(`Invalid special browse path: ${pathname}`);
  }

  return { filters, setFilters, commitBrowseFilters, clearFilters };
}

export function specialBrowseRefinementQueryEquals(
  pathname: string,
  filters: BrowseFilters,
  query: string,
): boolean {
  const expected = serializeSpecialPageRefinements(filters, pathname);
  return browseFilterQueryEquals(expected, query);
}
