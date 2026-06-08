import type { BrowseFilters } from "./filters";

/** Only these query keys may appear in an ISR-cached home URL. */
const ISR_ALLOWED_QUERY_KEYS = new Set(["type", "lang"]);

/**
 * Whether home page 1 should be server-rendered and ISR-cached.
 *
 * Allowed URLs (cached on first request):
 * - `/`, `/?type=tv`, `/?lang=hi`, `/?type=tv&lang=hi`
 *
 * All other query params (ott, genre, date, cast, crew, …) use client fetch only.
 */
export function isBrowseUrlIsrAllowed(
  filters: BrowseFilters,
  searchParams: URLSearchParams,
): boolean {
  for (const key of searchParams.keys()) {
    if (!ISR_ALLOWED_QUERY_KEYS.has(key)) {
      return false;
    }
  }

  if (filters.genreIds.length > 0) return false;
  if (filters.providerIds.length > 0) return false;
  if (filters.dateFrom || filters.dateTo) return false;
  if (filters.castPersonId || filters.crewPersonId) return false;

  return true;
}
