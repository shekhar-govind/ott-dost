import {
  DEFAULT_BROWSE_FILTERS,
  type BrowseFilters,
  type BrowseMediaType,
} from "./filters";
import { defaultBrowseLanguage } from "./languages";
import {
  browseNamespaceFromMediaType,
  browseSlugFacetIndex,
  browseSlugForLanguageCode,
  browseSlugForProviderId,
  canonicalizeBrowseSlug,
  lookupBrowseSlug,
  mediaTypeFromBrowseNamespace,
  type BrowsePathFacet,
  type BrowsePathNamespace,
} from "./slug-registry";

export interface ParsedBrowseSpecialPath {
  namespace: BrowsePathNamespace;
  mediaType: BrowseMediaType;
  /** Canonical slugs in path order (excludes type namespace). */
  segments: string[];
  filters: Pick<BrowseFilters, "language" | "genreIds" | "providerIds">;
}

function facetIndex(facet: BrowsePathFacet): number {
  const index = browseSlugFacetIndex(facet);
  if (index < 0) {
    throw new Error(`Unknown browse path facet: ${facet}`);
  }
  return index;
}

function emptyPathFilters(): Pick<
  BrowseFilters,
  "language" | "genreIds" | "providerIds"
> {
  return {
    language: defaultBrowseLanguage(),
    genreIds: [],
    providerIds: [],
  };
}

/**
 * Parse `/movies/…` or `/tv-shows/…` path segments into browse filters.
 * Returns null when the namespace or any segment is invalid / out of order.
 */
export function parseBrowseSpecialPath(pathname: string): ParsedBrowseSpecialPath | null {
  const trimmed = pathname.replace(/\/+$/, "") || "/";
  const parts = trimmed.split("/").filter(Boolean);
  if (parts.length === 0) return null;

  const mediaType = mediaTypeFromBrowseNamespace(parts[0]);
  if (!mediaType) return null;

  const namespace = parts[0] as BrowsePathNamespace;
  const rawSegments = parts.slice(1).map(canonicalizeBrowseSlug);
  if (rawSegments.length === 0) {
    return {
      namespace,
      mediaType,
      segments: [],
      filters: emptyPathFilters(),
    };
  }

  const filters = emptyPathFilters();
  const segments: string[] = [];
  const seenFacets = new Set<BrowsePathFacet>();
  let lastFacetIndex = -1;

  for (const segment of rawSegments) {
    const entry = lookupBrowseSlug(segment);
    if (!entry || entry.facet === "genre") {
      return null;
    }

    if (seenFacets.has(entry.facet)) {
      return null;
    }

    const currentFacetIndex = facetIndex(entry.facet);
    if (currentFacetIndex <= lastFacetIndex) {
      return null;
    }

    seenFacets.add(entry.facet);
    lastFacetIndex = currentFacetIndex;
    segments.push(entry.slug);

    if (entry.facet === "language") {
      filters.language = entry.languageCode;
    } else if (entry.facet === "provider") {
      filters.providerIds = [entry.providerId];
    }
  }

  return { namespace, mediaType, segments, filters };
}

/** Path facet slugs for a browse filter set, in canonical order. */
export function serializeBrowsePathSegments(
  filters: Pick<BrowseFilters, "language" | "genreIds" | "providerIds">,
): string[] {
  const segments: string[] = [];

  if (filters.language !== defaultBrowseLanguage()) {
    const languageSlug = browseSlugForLanguageCode(filters.language);
    if (languageSlug) segments.push(languageSlug);
  }

  // Genres deferred for launch — segment slot reserved for Stage 3+.

  const providerId = filters.providerIds[0];
  if (providerId != null) {
    const providerSlug = browseSlugForProviderId(providerId);
    if (providerSlug) segments.push(providerSlug);
  }

  return segments;
}

export function buildBrowseSpecialPagePath(filters: BrowseFilters): string {
  const namespace = browseNamespaceFromMediaType(filters.mediaType);
  const segments = serializeBrowsePathSegments(filters);
  if (segments.length === 0) {
    return `/${namespace}`;
  }
  return `/${namespace}/${segments.join("/")}`;
}

/** Merge path-derived filters with defaults for browse list fetching. */
export function browseFiltersFromSpecialPath(
  parsed: ParsedBrowseSpecialPath,
): BrowseFilters {
  return {
    ...DEFAULT_BROWSE_FILTERS,
    mediaType: parsed.mediaType,
    language: parsed.filters.language,
    genreIds: parsed.filters.genreIds,
    providerIds: parsed.filters.providerIds,
  };
}
