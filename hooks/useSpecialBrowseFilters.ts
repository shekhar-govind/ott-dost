"use client";

import { browseDebug } from "@/lib/browse/debug";
import {
  clearSavedBrowseFilters,
  persistBrowseFilters,
} from "@/lib/browse/filter-persistence";
import {
  browseFilterQueryEquals,
  type BrowseFilters,
} from "@/lib/browse/filters";
import { buildBrowseSpecialPagePath } from "@/lib/browse/path-facets";
import {
  parseSpecialPageFilters,
  serializeSpecialPageRefinements,
} from "@/lib/browse/special-page-filters";
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
      const nextPath = buildBrowseSpecialPagePath(next);
      const refinements = serializeSpecialPageRefinements(next, nextPath);
      const nextUrl = refinements ? `${nextPath}?${refinements}` : nextPath;
      const currentUrl =
        searchParams.toString().length > 0
          ? `${activePathname}?${searchParams.toString()}`
          : activePathname;

      if (nextUrl === currentUrl) return;

      browseDebug("Special page filters applied", {
        from: currentUrl,
        to: nextUrl,
        filters: next,
      });

      router.replace(nextUrl, { scroll: false });
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
    router.replace(buildBrowseSpecialPagePath(filters), { scroll: false });
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
