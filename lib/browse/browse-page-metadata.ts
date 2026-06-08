import type { Metadata } from "next";
import { getSiteBaseUrl } from "@/lib/site-url";
import {
  buildBrowseCanonicalPath,
  buildBrowseIndexableParentPath,
  isBrowseUrlIndexable,
} from "./isr-allowlist";
import { defaultBrowseLanguage } from "./languages";
import type { BrowseFilters } from "./filters";

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
  const isTv = filters.mediaType === "tv";
  const hasLanguage = filters.language !== defaultBrowseLanguage();

  if (!hasLanguage) {
    return isTv
      ? "Browse TV shows in India | OTT Dost"
      : "Browse movies in India | OTT Dost";
  }

  const languageName = languageRomanName(filters.language);
  return isTv
    ? `${languageName} TV shows — where to watch in India | OTT Dost`
    : `${languageName} movies — where to watch in India | OTT Dost`;
}

function buildBrowsePageDescription(filters: BrowseFilters): string {
  const isTv = filters.mediaType === "tv";
  const hasLanguage = filters.language !== defaultBrowseLanguage();

  if (!hasLanguage) {
    return isTv
      ? "Browse the latest TV shows and find where to stream them in India."
      : "Browse the latest movies and find where to stream, rent, or buy them in India.";
  }

  const languageName = languageRomanName(filters.language);
  return isTv
    ? `Browse ${languageName} TV shows and find where to stream them in India.`
    : `Browse ${languageName} movies and find where to stream, rent, or buy them in India.`;
}

function absoluteBrowseUrl(path: string): string {
  const baseUrl = getSiteBaseUrl();
  return baseUrl ? `${baseUrl}${path}` : path;
}

export function buildBrowsePageMetadata(
  filters: BrowseFilters,
  searchParams: URLSearchParams,
): Metadata {
  const indexable = isBrowseUrlIndexable(filters, searchParams);
  const canonicalPath = indexable
    ? buildBrowseCanonicalPath(filters)
    : buildBrowseIndexableParentPath(filters);
  const pageUrl = absoluteBrowseUrl(canonicalPath);
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
    robots: indexable
      ? { index: true, follow: true }
      : { index: false, follow: true },
  };
}
