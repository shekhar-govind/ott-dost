import type { Metadata } from "next";
import type { BrowseFilters } from "./filters";
import { defaultBrowseLanguage } from "./languages";
import { parseBrowseSpecialPath } from "./path-facets";
import { browseSlugDisplayName } from "./special-page-slug-labels";
import { specialPageHasQueryRefinements } from "./special-page-filters";
import { getSiteBaseUrl } from "@/lib/site-url";

function languageRomanName(code: string): string {
  try {
    return (
      new Intl.DisplayNames(["en"], { type: "language" }).of(code) ??
      code.toUpperCase()
    );
  } catch {
    return code.toUpperCase();
  }
}

function mediaTypeLabel(mediaType: BrowseFilters["mediaType"], plural = true): string {
  if (mediaType === "tv") return plural ? "TV shows" : "TV show";
  return plural ? "movies" : "movie";
}

export function buildSpecialBrowsePageHeading(
  filters: BrowseFilters,
  pathname: string,
): string {
  const parsed = parseBrowseSpecialPath(pathname);
  const typeLabel = mediaTypeLabel(filters.mediaType);
  const parts: string[] = [];

  if (parsed) {
    for (const segment of parsed.segments) {
      const name = browseSlugDisplayName(segment);
      if (name) parts.push(name);
    }
  }

  if (parts.length === 0) {
    return `Browse ${typeLabel}`;
  }

  const hasProvider = filters.providerIds.length > 0;
  const hasLanguage = filters.language !== defaultBrowseLanguage();

  if (hasLanguage && hasProvider && parts.length >= 2) {
    return `${parts[0]} ${typeLabel} on ${parts[1]}`;
  }

  if (hasProvider && parts.length === 1) {
    return `${typeLabel.charAt(0).toUpperCase()}${typeLabel.slice(1)} on ${parts[0]}`;
  }

  if (hasLanguage && parts.length === 1) {
    return `${parts[0]} ${typeLabel}`;
  }

  return `Browse ${typeLabel}`;
}

export function buildSpecialBrowsePageTitle(
  filters: BrowseFilters,
  pathname: string,
): string {
  const heading = buildSpecialBrowsePageHeading(filters, pathname);
  return `${heading} | OTT Dost`;
}

export function buildSpecialBrowsePageDescription(
  filters: BrowseFilters,
  pathname: string,
): string {
  const heading = buildSpecialBrowsePageHeading(filters, pathname);
  const lower = heading.charAt(0).toLowerCase() + heading.slice(1);
  return `Browse ${lower} and find where to stream them.`;
}

function absoluteUrl(path: string): string {
  const baseUrl = getSiteBaseUrl();
  return baseUrl ? `${baseUrl}${path}` : path;
}

export function buildSpecialBrowsePageMetadata(
  pathname: string,
  searchParams: URLSearchParams,
  filters: BrowseFilters,
): Metadata {
  const hasRefinements = specialPageHasQueryRefinements(searchParams);
  const pageUrl = absoluteUrl(pathname);
  const title = buildSpecialBrowsePageTitle(filters, pathname);
  const description = buildSpecialBrowsePageDescription(filters, pathname);

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      siteName: "OTT Dost",
      url: pageUrl,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    robots: hasRefinements
      ? { index: false, follow: true }
      : { index: true, follow: true },
  };
}

/** Visible list section title (matches page heading). */
export function buildSpecialBrowseListTitle(
  filters: BrowseFilters,
  pathname: string,
): string {
  return buildSpecialBrowsePageHeading(filters, pathname);
}

export { languageRomanName };
