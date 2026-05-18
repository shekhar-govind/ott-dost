"use client";

import {
  DEFAULT_BROWSE_FILTERS,
  parseBrowseFilters,
  serializeBrowseFilters,
  type BrowseFilters,
} from "@/lib/browse/filters";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export function useBrowseFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(
    () => parseBrowseFilters(searchParams),
    [searchParams],
  );

  const setFilters = useCallback(
    (next: BrowseFilters) => {
      if (pathname !== "/") return;

      const query = serializeBrowseFilters(next);
      router.replace(query ? `/?${query}` : "/", { scroll: false });
    },
    [pathname, router],
  );

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_BROWSE_FILTERS);
  }, [setFilters]);

  return { filters, setFilters, clearFilters };
}
