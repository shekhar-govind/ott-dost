import type { BrowseFilters } from "./filters";
import { parseBrowseFilters } from "./filters";

/** Next.js `searchParams` prop → browse filters. */
export function parseBrowseFiltersFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): BrowseFilters {
  const urlParams = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string") {
      urlParams.set(key, value);
    } else if (Array.isArray(value) && value[0]) {
      urlParams.set(key, value[0]);
    }
  }

  return parseBrowseFilters(urlParams);
}
