import {
  datePresetIdForFilters,
} from "./date-presets";
import {
  parseBrowseFilters,
  type BrowseFilters,
} from "./filters";
import { defaultBrowseLanguage } from "./languages";
import { dedupeOttProviderIds } from "./ott-platform-normalization";
import {
  browseFiltersFromSpecialPath,
  parseBrowseSpecialPath,
} from "./path-facets";
import {
  normalizeBrowseProviderIds,
  normalizePositiveIntegerIds,
} from "./query-hygiene";

function pathHasLanguage(pathname: string): boolean {
  const parsed = parseBrowseSpecialPath(pathname);
  if (!parsed) return false;
  return parsed.filters.language !== defaultBrowseLanguage();
}

function pathHasProvider(pathname: string): boolean {
  const parsed = parseBrowseSpecialPath(pathname);
  if (!parsed) return false;
  return parsed.filters.providerIds.length > 0;
}

/** Merge path facets with query refinements (genre, date, cast, crew, extra ott). */
export function parseSpecialPageFilters(
  pathname: string,
  searchParams: URLSearchParams,
): BrowseFilters | null {
  const parsed = parseBrowseSpecialPath(pathname);
  if (!parsed) return null;

  const base = browseFiltersFromSpecialPath(parsed);
  const query = parseBrowseFilters(searchParams);

  return {
    ...base,
    genreIds: query.genreIds,
    dateFrom: query.dateFrom,
    dateTo: query.dateTo,
    castPersonId: query.castPersonId,
    crewPersonId: query.crewPersonId,
    language: pathHasLanguage(pathname) ? base.language : query.language,
    providerIds: pathHasProvider(pathname)
      ? base.providerIds
      : query.providerIds,
  };
}

/** Query string for non-path refinements on a special browse page. */
export function serializeSpecialPageRefinements(
  filters: BrowseFilters,
  pathname: string,
): string {
  const params = new URLSearchParams();

  const genreIds = normalizePositiveIntegerIds(filters.genreIds);
  if (genreIds.length > 0) {
    params.set("genre", genreIds.join(","));
  }

  const datePresetId = datePresetIdForFilters(filters);
  if (datePresetId && datePresetId !== "any" && datePresetId !== "custom") {
    params.set("date", datePresetId);
  } else {
    if (filters.dateFrom) {
      params.set("from", filters.dateFrom.slice(0, 4));
    }
    if (filters.dateTo) {
      params.set("to", filters.dateTo.slice(0, 4));
    }
  }

  if (!pathHasProvider(pathname)) {
    const providerIds = normalizeBrowseProviderIds(
      dedupeOttProviderIds(filters.providerIds),
    );
    if (providerIds.length > 0) {
      params.set("ott", providerIds.join(","));
    }
  }

  if (!pathHasLanguage(pathname) && filters.language !== defaultBrowseLanguage()) {
    params.set("lang", filters.language);
  }

  if (filters.castPersonId) {
    params.set("cast", String(filters.castPersonId));
  }

  if (filters.crewPersonId) {
    params.set("crew", String(filters.crewPersonId));
  }

  return params.toString();
}

/** Whether the URL carries refinements beyond the path facets. */
export function specialPageHasQueryRefinements(
  searchParams: URLSearchParams,
): boolean {
  return searchParams.toString().length > 0;
}

/** Filter key for list caching — path plus refinement query. */
export function specialPageFilterKey(
  pathname: string,
  searchParams: URLSearchParams,
): string {
  const refinements = serializeSpecialPageRefinements(
    parseSpecialPageFilters(pathname, searchParams) ??
      parseBrowseFilters(searchParams),
    pathname,
  );
  return refinements ? `${pathname}?${refinements}` : pathname;
}
