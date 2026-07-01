import {
  DEFAULT_BROWSE_FILTERS,
  filtersAreEqual,
  parseBrowseFilters,
  serializeBrowseFilters,
  type BrowseFilters,
} from "./filters";
import { defaultBrowseLanguage } from "./languages";
import { buildBrowseSpecialPagePath } from "./path-facets";
import {
  browseSlugForLanguageCode,
  browseSlugForProviderId,
} from "./slug-registry";
import {
  parseSpecialPageFilters,
  serializeSpecialPageRefinements,
} from "./special-page-filters";

/** Whether language + primary OTT can be expressed as special-page path segments. */
export function canRepresentCoreFacetsOnSpecialPath(
  filters: BrowseFilters,
): boolean {
  if (
    filters.language !== defaultBrowseLanguage() &&
    !browseSlugForLanguageCode(filters.language)
  ) {
    return false;
  }

  const primaryProviderId = filters.providerIds[0];
  if (primaryProviderId != null && !browseSlugForProviderId(primaryProviderId)) {
    return false;
  }

  return true;
}

/** Canonical destination for a filter set (home, special path, or home query fallback). */
export function resolveBrowseFilterDestination(filters: BrowseFilters): string {
  if (filtersAreEqual(filters, DEFAULT_BROWSE_FILTERS)) {
    return "/";
  }

  if (!canRepresentCoreFacetsOnSpecialPath(filters)) {
    const query = serializeBrowseFilters(filters);
    return query ? `/?${query}` : "/";
  }

  const pathname = buildBrowseSpecialPagePath(filters);
  const refinements = serializeSpecialPageRefinements(filters, pathname);
  return refinements ? `${pathname}?${refinements}` : pathname;
}

/** Normalize a home URL for comparison (default movies → `/`). */
export function normalizeHomeBrowseUrl(searchParams: URLSearchParams): string {
  const filters = parseBrowseFilters(searchParams);
  if (filtersAreEqual(filters, DEFAULT_BROWSE_FILTERS)) {
    return "/";
  }

  const query = serializeBrowseFilters(filters);
  return query ? `/?${query}` : "/";
}

/** Canonical URL for the current browse location, if filters are known. */
export function resolveCurrentBrowseUrl(
  pathname: string,
  searchParams: URLSearchParams,
): string {
  if (pathname === "/") {
    return normalizeHomeBrowseUrl(searchParams);
  }

  const filters = parseSpecialPageFilters(pathname, searchParams);
  if (!filters) {
    return searchParams.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;
  }

  return resolveBrowseFilterDestination(filters);
}
