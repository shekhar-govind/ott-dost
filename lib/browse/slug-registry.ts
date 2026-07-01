import type { BrowseMediaType } from "./filters";
import { chipCanonicalOttProviderId } from "./ott-platform-normalization";

export type BrowsePathFacet = "language" | "genre" | "provider";

export type BrowsePathNamespace = "movies" | "tv-shows";

export interface BrowseLanguageSlugEntry {
  facet: "language";
  slug: string;
  languageCode: string;
}

export interface BrowseProviderSlugEntry {
  facet: "provider";
  slug: string;
  /** Canonical TMDB India provider id (chip id). */
  providerId: number;
}

export interface BrowseGenreSlugEntry {
  facet: "genre";
  slug: string;
}

export type BrowseSlugEntry =
  | BrowseLanguageSlugEntry
  | BrowseProviderSlugEntry
  | BrowseGenreSlugEntry;

/** Fixed segment order on special browse paths. */
export const BROWSE_PATH_FACET_ORDER: readonly BrowsePathFacet[] = [
  "language",
  "genre",
  "provider",
];

const LANGUAGE_SLUG_ENTRIES: readonly BrowseLanguageSlugEntry[] = [
  { facet: "language", slug: "hindi", languageCode: "hi" },
  { facet: "language", slug: "english", languageCode: "en" },
  { facet: "language", slug: "tamil", languageCode: "ta" },
  { facet: "language", slug: "telugu", languageCode: "te" },
  { facet: "language", slug: "malayalam", languageCode: "ml" },
  { facet: "language", slug: "punjabi", languageCode: "pa" },
  { facet: "language", slug: "marathi", languageCode: "mr" },
  { facet: "language", slug: "bengali", languageCode: "bn" },
  { facet: "language", slug: "korean", languageCode: "ko" },
  { facet: "language", slug: "kannada", languageCode: "kn" },
] as const;

/**
 * Canonical TMDB India provider ids for launch special pages.
 * Ids match {@link chipCanonicalOttProviderId} / ott-platform-normalization.
 */
const PROVIDER_SLUG_ENTRIES: readonly BrowseProviderSlugEntry[] = [
  { facet: "provider", slug: "netflix", providerId: 8 },
  { facet: "provider", slug: "prime-video", providerId: 119 },
  { facet: "provider", slug: "jiohotstar", providerId: 2336 },
  { facet: "provider", slug: "zee5", providerId: 350 },
  { facet: "provider", slug: "sonyliv", providerId: 561 },
  { facet: "provider", slug: "mxplayer", providerId: 515 },
] as const;

/** Alternate spellings → canonical slug (301 targets in Stage 4). */
export const BROWSE_SLUG_ALIASES: Readonly<Record<string, string>> = {
  "amazon-prime": "prime-video",
  "prime": "prime-video",
  "hotstar": "jiohotstar",
  "jio-hotstar": "jiohotstar",
  "sony-liv": "sonyliv",
  "mx-player": "mxplayer",
};

const SLUG_LOOKUP = new Map<string, BrowseSlugEntry>();

function registerSlug(entry: BrowseSlugEntry): void {
  SLUG_LOOKUP.set(entry.slug, entry);
}

for (const entry of LANGUAGE_SLUG_ENTRIES) registerSlug(entry);
for (const entry of PROVIDER_SLUG_ENTRIES) registerSlug(entry);

export const LAUNCH_BROWSE_LANGUAGE_SLUGS = LANGUAGE_SLUG_ENTRIES.map(
  (entry) => entry.slug,
);
export const LAUNCH_BROWSE_PROVIDER_SLUGS = PROVIDER_SLUG_ENTRIES.map(
  (entry) => entry.slug,
);

export function browseNamespaceFromMediaType(
  mediaType: BrowseMediaType,
): BrowsePathNamespace {
  return mediaType === "tv" ? "tv-shows" : "movies";
}

export function mediaTypeFromBrowseNamespace(
  namespace: string,
): BrowseMediaType | null {
  if (namespace === "movies") return "movie";
  if (namespace === "tv-shows") return "tv";
  return null;
}

export function canonicalizeBrowseSlug(slug: string): string {
  const normalized = slug.trim().toLowerCase();
  return BROWSE_SLUG_ALIASES[normalized] ?? normalized;
}

export function lookupBrowseSlug(slug: string): BrowseSlugEntry | null {
  return SLUG_LOOKUP.get(canonicalizeBrowseSlug(slug)) ?? null;
}

export function browseSlugFacetIndex(facet: BrowsePathFacet): number {
  return BROWSE_PATH_FACET_ORDER.indexOf(facet);
}

export function languageCodeForBrowseSlug(slug: string): string | null {
  const entry = lookupBrowseSlug(slug);
  return entry?.facet === "language" ? entry.languageCode : null;
}

export function providerIdForBrowseSlug(slug: string): number | null {
  const entry = lookupBrowseSlug(slug);
  if (entry?.facet !== "provider") return null;
  return chipCanonicalOttProviderId(entry.providerId);
}

export function browseSlugForLanguageCode(languageCode: string): string | null {
  const normalized = languageCode.trim().toLowerCase();
  for (const entry of LANGUAGE_SLUG_ENTRIES) {
    if (entry.languageCode === normalized) return entry.slug;
  }
  return null;
}

export function browseSlugForProviderId(providerId: number): string | null {
  const canonicalId = chipCanonicalOttProviderId(providerId);
  for (const entry of PROVIDER_SLUG_ENTRIES) {
    if (entry.providerId === canonicalId) return entry.slug;
  }
  return null;
}
