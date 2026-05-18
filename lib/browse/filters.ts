import { defaultBrowseLanguageCodes, isBrowseLanguageCode } from "./languages";

export type BrowseMediaType = "all" | "movie" | "tv";

export interface BrowseFilters {
  languages: string[];
  mediaType: BrowseMediaType;
  genreIds: number[];
  dateFrom: string | null;
  dateTo: string | null;
  providerIds: number[];
}

export const DEFAULT_BROWSE_FILTERS: BrowseFilters = {
  languages: defaultBrowseLanguageCodes(),
  mediaType: "all",
  genreIds: [],
  dateFrom: null,
  dateTo: null,
  providerIds: [],
};

export function parseBrowseFilters(
  searchParams: URLSearchParams,
): BrowseFilters {
  const languagesParam = searchParams.get("lang");
  const languages = languagesParam
    ? languagesParam
        .split(",")
        .map((code) => code.trim().toLowerCase())
        .filter(isBrowseLanguageCode)
    : defaultBrowseLanguageCodes();

  const mediaTypeParam = searchParams.get("type");
  const mediaType: BrowseMediaType =
    mediaTypeParam === "all" || mediaTypeParam === "tv" || mediaTypeParam === "movie"
      ? mediaTypeParam
      : DEFAULT_BROWSE_FILTERS.mediaType;

  const genreIds = (searchParams.get("genre") ?? "")
    .split(",")
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id > 0);

  const providerIds = (searchParams.get("ott") ?? "")
    .split(",")
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id > 0);

  const dateFrom = normalizeDateParam(searchParams.get("from"), "start");
  const dateTo = normalizeDateParam(searchParams.get("to"), "end");

  return {
    languages: languages.length > 0 ? languages : defaultBrowseLanguageCodes(),
    mediaType,
    genreIds,
    dateFrom,
    dateTo,
    providerIds,
  };
}

function normalizeDateParam(
  value: string | null,
  bound: "start" | "end",
): string | null {
  if (!value) return null;
  if (/^\d{4}$/.test(value)) {
    return bound === "start" ? `${value}-01-01` : `${value}-12-31`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return null;
}

export function serializeBrowseFilters(filters: BrowseFilters): string {
  const params = new URLSearchParams();
  const defaults = DEFAULT_BROWSE_FILTERS;

  const langKey = filters.languages.slice().sort().join(",");
  const defaultLangKey = defaults.languages.slice().sort().join(",");
  if (langKey !== defaultLangKey) {
    params.set("lang", filters.languages.join(","));
  }

  if (filters.mediaType !== defaults.mediaType) {
    params.set("type", filters.mediaType);
  }

  if (filters.genreIds.length > 0) {
    params.set("genre", filters.genreIds.join(","));
  }

  if (filters.dateFrom) {
    params.set("from", filters.dateFrom.slice(0, 4));
  }

  if (filters.dateTo) {
    params.set("to", filters.dateTo.slice(0, 4));
  }

  if (filters.providerIds.length > 0) {
    params.set("ott", filters.providerIds.join(","));
  }

  return params.toString();
}

export function filtersAreEqual(a: BrowseFilters, b: BrowseFilters): boolean {
  return serializeBrowseFilters(a) === serializeBrowseFilters(b);
}

export function languagesMatchDefault(languages: string[]): boolean {
  const selected = languages.slice().sort().join(",");
  const defaults = defaultBrowseLanguageCodes().slice().sort().join(",");
  return selected === defaults;
}

export function countActiveBrowseFilters(filters: BrowseFilters): number {
  let count = 0;
  const defaults = DEFAULT_BROWSE_FILTERS;

  if (!languagesMatchDefault(filters.languages)) {
    count += 1;
  }
  if (filters.mediaType !== defaults.mediaType) count += 1;
  if (filters.genreIds.length > 0) count += 1;
  if (filters.dateFrom || filters.dateTo) count += 1;
  if (filters.providerIds.length > 0) count += 1;

  return count;
}

export function hasNonDefaultBrowseFilters(filters: BrowseFilters): boolean {
  return countActiveBrowseFilters(filters) > 0;
}
