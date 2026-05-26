import {
  datePresetIdForFilters,
  getBrowseDatePreset,
} from "./date-presets";
import { isAllowedBrowseLanguageCode } from "./indian-language-codes";
import { defaultBrowseLanguage } from "./languages";
import { dedupeOttProviderIds } from "./ott-platform-normalization";

export type BrowseMediaType = "movie" | "tv";

export const DEFAULT_BROWSE_MEDIA_TYPE: BrowseMediaType = "movie";

export interface BrowseFilters {
  /** `all` omits TMDB `with_original_language`; otherwise ISO 639-1. */
  language: string;
  mediaType: BrowseMediaType;
  genreIds: number[];
  dateFrom: string | null;
  dateTo: string | null;
  providerIds: number[];
  /** TMDB person id; set via title-page cast links. */
  castPersonId: number | null;
  /** TMDB person id; set via title-page crew links. */
  crewPersonId: number | null;
}

export const DEFAULT_BROWSE_FILTERS: BrowseFilters = {
  language: defaultBrowseLanguage(),
  mediaType: DEFAULT_BROWSE_MEDIA_TYPE,
  genreIds: [],
  dateFrom: null,
  dateTo: null,
  providerIds: [],
  castPersonId: null,
  crewPersonId: null,
};

export function parseBrowseFilters(
  searchParams: URLSearchParams,
): BrowseFilters {
  const langParam = searchParams.get("lang");
  const parsedLanguage = langParam
    ? langParam
        .split(",")
        .map((code) => code.trim().toLowerCase())
        .find(isAllowedBrowseLanguageCode)
    : undefined;

  const mediaType = normalizeBrowseMediaType(searchParams.get("type"));

  const genreIds = (searchParams.get("genre") ?? "")
    .split(",")
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id > 0);

  const providerIds = dedupeOttProviderIds(
    (searchParams.get("ott") ?? "")
      .split(",")
      .map((id) => Number(id))
      .filter((id) => Number.isInteger(id) && id > 0),
  );

  const datePresetParam = searchParams.get("date");
  const preset = datePresetParam
    ? getBrowseDatePreset(datePresetParam)
  : undefined;

  const dateFrom = preset
    ? preset.from
    : normalizeDateParam(searchParams.get("from"), "start");
  const dateTo = preset
    ? preset.to
    : normalizeDateParam(searchParams.get("to"), "end");

  return {
    language: parsedLanguage ?? defaultBrowseLanguage(),
    mediaType,
    genreIds,
    dateFrom,
    dateTo,
    providerIds,
    castPersonId: parseBrowsePersonIdParam(searchParams.get("cast")),
    crewPersonId: parseBrowsePersonIdParam(searchParams.get("crew")),
  };
}

function parseBrowsePersonIdParam(idParam: string | null): number | null {
  if (!idParam) return null;
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

/** Legacy `type=all` URLs map to the default (movies). */
export function normalizeBrowseMediaType(
  value: string | null | undefined,
): BrowseMediaType {
  if (value === "tv") return "tv";
  if (value === "movie") return "movie";
  return DEFAULT_BROWSE_MEDIA_TYPE;
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

  if (filters.language !== defaults.language) {
    params.set("lang", filters.language);
  }

  params.set("type", filters.mediaType);

  if (filters.genreIds.length > 0) {
    params.set("genre", filters.genreIds.join(","));
  }

  const datePresetId = resolveDatePresetIdForSerialize(filters);
  if (datePresetId) {
    params.set("date", datePresetId);
  } else {
    if (filters.dateFrom) {
      params.set("from", filters.dateFrom.slice(0, 4));
    }
    if (filters.dateTo) {
      params.set("to", filters.dateTo.slice(0, 4));
    }
  }

  if (filters.providerIds.length > 0) {
    params.set("ott", filters.providerIds.join(","));
  }

  if (filters.castPersonId) {
    params.set("cast", String(filters.castPersonId));
  }

  if (filters.crewPersonId) {
    params.set("crew", String(filters.crewPersonId));
  }

  return params.toString();
}

export function filtersAreEqual(a: BrowseFilters, b: BrowseFilters): boolean {
  return serializeBrowseFilters(a) === serializeBrowseFilters(b);
}

/** Compare filter query strings regardless of param order. */
export function browseFilterQueryEquals(a: string, b: string): boolean {
  if (a === b) return true;

  const paramsA = new URLSearchParams(a);
  const paramsB = new URLSearchParams(b);
  const keys = new Set([...paramsA.keys(), ...paramsB.keys()]);

  for (const key of keys) {
    if (paramsA.get(key) !== paramsB.get(key)) return false;
  }

  return true;
}

export function languageMatchesDefault(language: string): boolean {
  return language === defaultBrowseLanguage();
}

/** Sheet filters only (language, genre, date, OTT) — excludes content type. */
export function countBrowseRefinementFilters(filters: BrowseFilters): number {
  let count = 0;

  if (!languageMatchesDefault(filters.language)) {
    count += 1;
  }
  if (filters.genreIds.length > 0) count += 1;
  if (filters.dateFrom || filters.dateTo) count += 1;
  if (filters.providerIds.length > 0) count += 1;
  if (filters.castPersonId) count += 1;
  if (filters.crewPersonId) count += 1;

  return count;
}

/** Badge on the Filters button; content type is always counted. */
export function countActiveBrowseFilters(filters: BrowseFilters): number {
  return 1 + countBrowseRefinementFilters(filters);
}

export function hasNonDefaultBrowseFilters(filters: BrowseFilters): boolean {
  return countBrowseRefinementFilters(filters) > 0;
}

function resolveDatePresetIdForSerialize(filters: BrowseFilters): string | null {
  const id = datePresetIdForFilters(filters);
  return id === "any" || id === "custom" ? null : id;
}
