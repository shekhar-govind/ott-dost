"use client";

import { browseDebug } from "@/lib/browse/debug";
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
  serializeBrowseFilters,
  type BrowseFilters,
} from "@/lib/browse/filters";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";

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
    (next: BrowseFilters) => {
      if (pathname !== "/") return;

      const query = serializeBrowseFilters(next);
      browseDebug("Filters applied to URL", {
        providerIds: next.providerIds,
        serializedOttParam: next.providerIds.length > 0 ? next.providerIds.join(",") : null,
        fullQuery: query || null,
        filters: next,
      });
      router.replace(query ? `/?${query}` : "/", { scroll: false });
    },
    [pathname, router],
  );

  /** Apply filters and remember them — only for explicit user actions. */
  const commitBrowseFilters = useCallback(
    (next: BrowseFilters) => {
      persistBrowseFilters(next);
      setFilters(next);
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
    setFilters(DEFAULT_BROWSE_FILTERS);
  }, [setFilters]);

  return { filters, setFilters, commitBrowseFilters, clearFilters };
}
