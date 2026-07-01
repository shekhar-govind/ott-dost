import {
  DEFAULT_BROWSE_MEDIA_TYPE,
  hasNonDefaultBrowseFilters,
  languageMatchesDefault,
  parseBrowseFilters,
  type BrowseFilters,
} from "@/lib/browse/filters";
import { isBrowseSpecialPathname } from "@/lib/browse/is-browse-special-path";
import { findOttProviderOption } from "@/lib/browse/ott-platform-normalization";
import { parseSpecialPageFilters } from "@/lib/browse/special-page-filters";
import { buildSpecialBrowsePageHeading } from "@/lib/browse/special-page-metadata";
import { appendShareUrlToHeadline } from "@/lib/build-title-share-payload";
import {
  BROWSE_SHARE_MEDIA_LABEL,
  formatContextualShareHeadline,
  shareTitleFromContext,
  SITE_SHARE_HEADLINE,
} from "@/lib/share-brand";
import type { SharePayload } from "@/lib/share-payload";
import { isTitleRoutePath } from "@/lib/title-detail-path";

export interface SiteShareContextOptions {
  personName?: string | null;
  providerName?: string | null;
}

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

function isDefaultBrowseFilters(filters: BrowseFilters): boolean {
  return (
    filters.mediaType === DEFAULT_BROWSE_MEDIA_TYPE &&
    !hasNonDefaultBrowseFilters(filters)
  );
}

function shareContextFromSpecialHeading(heading: string): string {
  if (heading.startsWith("Browse ")) return heading.slice("Browse ".length);
  return heading;
}

function buildBrowseShareHeading(
  filters: BrowseFilters,
  pathname: string,
): string {
  return buildSpecialBrowsePageHeading(filters, pathname, {
    typeLabel: BROWSE_SHARE_MEDIA_LABEL,
  });
}

function buildPersonShareContext(personName: string | null | undefined): string {
  const name = personName?.trim();
  return `${BROWSE_SHARE_MEDIA_LABEL} with ${name || "this person"}`;
}

function buildHomeShareContext(
  filters: BrowseFilters,
  opts: SiteShareContextOptions,
): string {
  if (filters.castPersonId || filters.crewPersonId) {
    return buildPersonShareContext(opts.personName);
  }

  if (isDefaultBrowseFilters(filters)) {
    return SITE_SHARE_HEADLINE.replace(/ \| OTT Dost$/, "");
  }

  const hasLang = !languageMatchesDefault(filters.language);
  const hasProvider = filters.providerIds.length > 0;
  const langName = hasLang ? languageRomanName(filters.language) : null;
  const providerName = hasProvider ? opts.providerName?.trim() : null;

  if (hasLang && hasProvider && langName && providerName) {
    return `${langName} ${BROWSE_SHARE_MEDIA_LABEL} on ${providerName}`;
  }

  if (hasProvider && providerName) {
    const capitalized = `${BROWSE_SHARE_MEDIA_LABEL.charAt(0).toUpperCase()}${BROWSE_SHARE_MEDIA_LABEL.slice(1)}`;
    return `${capitalized} on ${providerName}`;
  }

  if (hasLang && langName) {
    return `${langName} ${BROWSE_SHARE_MEDIA_LABEL}`;
  }

  return SITE_SHARE_HEADLINE.replace(/ \| OTT Dost$/, "");
}

function buildLegalShareHeadline(pathname: string): string {
  if (pathname === "/privacy") {
    return `OTT Dost - Privacy Policy | OTT Dost`;
  }
  if (pathname === "/disclaimer") {
    return `OTT Dost - Disclaimer | OTT Dost`;
  }
  return SITE_SHARE_HEADLINE;
}

function isBrandShareContext(context: string): boolean {
  return context.startsWith("Find where to watch ");
}

export function resolveBrowseFiltersForShare(
  pathname: string,
  searchParams: URLSearchParams,
): BrowseFilters | null {
  if (pathname === "/") {
    return parseBrowseFilters(searchParams);
  }
  if (isBrowseSpecialPathname(pathname)) {
    return parseSpecialPageFilters(pathname, searchParams);
  }
  return null;
}

export function buildSiteShareHeadline(
  pathname: string,
  filters: BrowseFilters | null,
  opts: SiteShareContextOptions = {},
): string {
  if (filters && (filters.castPersonId || filters.crewPersonId)) {
    return formatContextualShareHeadline(buildPersonShareContext(opts.personName));
  }

  if (isBrowseSpecialPathname(pathname) && filters) {
    const context = shareContextFromSpecialHeading(
      buildBrowseShareHeading(filters, pathname),
    );
    return formatContextualShareHeadline(context);
  }

  if (pathname === "/" && filters) {
    const context = buildHomeShareContext(filters, opts);
    if (isBrandShareContext(context)) {
      return `${context} | OTT Dost`;
    }
    return formatContextualShareHeadline(context);
  }

  return buildLegalShareHeadline(pathname);
}

export function buildSiteSharePayload(
  pathname: string,
  searchParams: URLSearchParams,
  opts: SiteShareContextOptions = {},
): SharePayload | undefined {
  if (isTitleRoutePath(pathname)) {
    return undefined;
  }

  const filters = resolveBrowseFiltersForShare(pathname, searchParams);
  const text = buildSiteShareHeadline(pathname, filters, opts);

  let title = text;
  if (filters && (filters.castPersonId || filters.crewPersonId)) {
    title = shareTitleFromContext(buildPersonShareContext(opts.personName));
  } else if (isBrowseSpecialPathname(pathname) && filters) {
    title = shareTitleFromContext(
      shareContextFromSpecialHeading(
        buildBrowseShareHeading(filters, pathname),
      ),
    );
  } else if (pathname === "/" && filters) {
    const context = buildHomeShareContext(filters, opts);
    title = isBrandShareContext(context)
      ? `${context} | OTT Dost`
      : shareTitleFromContext(context);
  }

  const query = searchParams.toString();
  const url = query ? `${pathname}?${query}` : pathname;

  return {
    title,
    text,
    clipboardText: text,
    url,
  };
}

export function appendSiteShareUrl(
  payload: SharePayload,
  absoluteUrl: string,
): SharePayload {
  return {
    ...payload,
    clipboardText: appendShareUrlToHeadline(payload.clipboardText ?? payload.text ?? "", absoluteUrl),
  };
}

export function resolveProviderNameForFilters(
  filters: BrowseFilters,
  providerOptions: { id: number; name: string }[],
): string | undefined {
  const providerId = filters.providerIds[0];
  if (!providerId) return undefined;
  return findOttProviderOption(providerOptions, providerId)?.name;
}
