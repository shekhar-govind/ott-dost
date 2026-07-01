import type { Metadata } from "next";
import { getSiteBaseUrl } from "@/lib/site-url";
import { DEFAULT_BROWSE_FILTERS, type BrowseFilters } from "./filters";
import { defaultBrowseLanguage } from "./languages";

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

export function buildBrowsePageTitle(filters: BrowseFilters): string {
  const hasLanguage = filters.language !== defaultBrowseLanguage();

  if (!hasLanguage) {
    return "Browse movies and TV shows in India | OTT Dost";
  }

  const languageName = languageRomanName(filters.language);
  return `${languageName} movies and TV shows — where to watch in India | OTT Dost`;
}

function buildBrowsePageDescription(filters: BrowseFilters): string {
  const hasLanguage = filters.language !== defaultBrowseLanguage();

  if (!hasLanguage) {
    return "Browse movies and TV shows and find where to stream them in India.";
  }

  const languageName = languageRomanName(filters.language);
  return `Browse ${languageName} movies and TV shows and find where to stream them in India.`;
}

function absoluteBrowseUrl(path: string): string {
  const baseUrl = getSiteBaseUrl();
  return baseUrl ? `${baseUrl}${path}` : path;
}

export function buildBrowsePageMetadata(
  filters: BrowseFilters = DEFAULT_BROWSE_FILTERS,
): Metadata {
  const pageUrl = absoluteBrowseUrl("/");
  const title = buildBrowsePageTitle(filters);
  const description = buildBrowsePageDescription(filters);

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
    robots: { index: true, follow: true },
  };
}
