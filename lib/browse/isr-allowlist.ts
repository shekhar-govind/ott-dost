import {
  DEFAULT_BROWSE_FILTERS,
  DEFAULT_BROWSE_MEDIA_TYPE,
  serializeBrowseFilters,
  type BrowseFilters,
} from "./filters";
import {
  EXTRA_BROWSE_LANGUAGE_CODES,
  INDIAN_OFFICIAL_LANGUAGE_CODES,
  isAllowedBrowseLanguageCode,
} from "./indian-language-codes";
import { BROWSE_LANGUAGE_ALL, defaultBrowseLanguage } from "./languages";

/** Only these query keys may appear on an indexable / ISR-cached home URL. */
const ISR_ALLOWED_QUERY_KEYS = new Set(["type", "lang"]);

/** Chip language codes used for indexable `lang` browse URLs and the sitemap. */
export const INDEXABLE_BROWSE_LANGUAGE_CODES = [
  ...INDIAN_OFFICIAL_LANGUAGE_CODES,
  ...EXTRA_BROWSE_LANGUAGE_CODES,
] as const;

function isDefaultBrowseFilters(filters: BrowseFilters): boolean {
  return (
    filters.mediaType === DEFAULT_BROWSE_MEDIA_TYPE &&
    filters.language === defaultBrowseLanguage() &&
    filters.genreIds.length === 0 &&
    filters.providerIds.length === 0 &&
    !filters.dateFrom &&
    !filters.dateTo &&
    !filters.castPersonId &&
    !filters.crewPersonId
  );
}

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

/** Whether a home URL should be indexed (same allowlist as ISR, plus param validation). */
export function isBrowseUrlIndexable(
  filters: BrowseFilters,
  searchParams: URLSearchParams,
): boolean {
  if (!isBrowseUrlIsrAllowed(filters, searchParams)) {
    return false;
  }

  const typeParam = searchParams.get("type");
  if (typeParam && typeParam !== "movie" && typeParam !== "tv") {
    return false;
  }

  const langParam = searchParams.get("lang");
  if (langParam) {
    const firstLang = langParam.split(",")[0]?.trim().toLowerCase() ?? "";
    if (!firstLang || !isAllowedBrowseLanguageCode(firstLang)) {
      return false;
    }
    if (firstLang === BROWSE_LANGUAGE_ALL) {
      return false;
    }
  }

  return true;
}

/** Strip non-indexable filter dimensions for canonical targets on filtered URLs. */
export function toIndexableBrowseFilters(filters: BrowseFilters): BrowseFilters {
  return {
    ...filters,
    genreIds: [],
    providerIds: [],
    dateFrom: null,
    dateTo: null,
    castPersonId: null,
    crewPersonId: null,
  };
}

/** Canonical home path: `/` or `/?type=…&lang=…` (defaults collapse to `/`). */
export function buildBrowseCanonicalPath(filters: BrowseFilters): string {
  if (isDefaultBrowseFilters(filters)) {
    return "/";
  }

  const query = serializeBrowseFilters(filters);
  return query ? `/?${query}` : "/";
}

/** Nearest indexable parent URL for non-indexable browse filter combinations. */
export function buildBrowseIndexableParentPath(filters: BrowseFilters): string {
  return buildBrowseCanonicalPath(toIndexableBrowseFilters(filters));
}

/** All indexable browse paths for the sitemap (includes canonical duplicates collapsed). */
export function listIndexableBrowsePaths(): string[] {
  const paths = new Set<string>(["/", "/?type=tv"]);

  for (const code of INDEXABLE_BROWSE_LANGUAGE_CODES) {
    paths.add(
      buildBrowseCanonicalPath({
        ...DEFAULT_BROWSE_FILTERS,
        language: code,
      }),
    );
    paths.add(
      buildBrowseCanonicalPath({
        ...DEFAULT_BROWSE_FILTERS,
        mediaType: "tv",
        language: code,
      }),
    );
  }

  return [...paths].sort();
}
