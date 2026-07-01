import type { BrowseMediaType } from "./filters";
import {
  LAUNCH_BROWSE_LANGUAGE_SLUGS,
  LAUNCH_BROWSE_PROVIDER_SLUGS,
  browseNamespaceFromMediaType,
} from "./slug-registry";
import { browseSlugDisplayName } from "./special-page-slug-labels";

export interface FooterBrowseFacetRow {
  slug: string;
  label: string;
  moviesHref: string;
  tvHref: string;
}

export interface FooterBrowseProviderCombo {
  slug: string;
  label: string;
  moviesHref: string;
  tvHref: string;
}

export interface FooterBrowseLanguageSection {
  slug: string;
  label: string;
  moviesHref: string;
  tvHref: string;
  providerCombos: FooterBrowseProviderCombo[];
}

export interface FooterBrowseTaxonomy {
  languageRows: FooterBrowseFacetRow[];
  platformRows: FooterBrowseFacetRow[];
  languageSections: FooterBrowseLanguageSection[];
}

function browsePath(mediaType: BrowseMediaType, segments: readonly string[]): string {
  const namespace = browseNamespaceFromMediaType(mediaType);
  if (segments.length === 0) return `/${namespace}`;
  return `/${namespace}/${segments.join("/")}`;
}

function mediaPairForSegments(segments: readonly string[]): {
  moviesHref: string;
  tvHref: string;
} {
  return {
    moviesHref: browsePath("movie", segments),
    tvHref: browsePath("tv", segments),
  };
}

function facetRow(slug: string): FooterBrowseFacetRow | null {
  const label = browseSlugDisplayName(slug);
  if (!label) return null;

  const { moviesHref, tvHref } = mediaPairForSegments([slug]);
  return { slug, label, moviesHref, tvHref };
}

/** Structured browse links for the site footer (Option A taxonomy). */
export function buildFooterBrowseTaxonomy(): FooterBrowseTaxonomy {
  const languageRows = LAUNCH_BROWSE_LANGUAGE_SLUGS.map(facetRow).filter(
    (row): row is FooterBrowseFacetRow => row != null,
  );

  const platformRows = LAUNCH_BROWSE_PROVIDER_SLUGS.map(facetRow).filter(
    (row): row is FooterBrowseFacetRow => row != null,
  );

  const languageSections: FooterBrowseLanguageSection[] = languageRows.map(
    (language) => ({
      slug: language.slug,
      label: language.label,
      moviesHref: language.moviesHref,
      tvHref: language.tvHref,
      providerCombos: platformRows.map((platform) => {
        const segments = [language.slug, platform.slug] as const;
        const { moviesHref, tvHref } = mediaPairForSegments(segments);
        return {
          slug: platform.slug,
          label: platform.label,
          moviesHref,
          tvHref,
        };
      }),
    }),
  );

  return { languageRows, platformRows, languageSections };
}
