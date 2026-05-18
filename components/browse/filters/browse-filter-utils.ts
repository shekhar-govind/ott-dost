import { browseDebug } from "@/lib/browse/debug";
import type { BrowseFilters } from "@/lib/browse/filters";
import { defaultBrowseLanguage } from "@/lib/browse/languages";
import {
  dedupeOttProviderIds,
  findOttPlatformGroup,
  ottProviderIdsMatch,
} from "@/lib/browse/ott-platform-normalization";
import type { BrowseFilterMeta } from "@/lib/browse/types";

export function genreOptionsForMediaType(
  meta: BrowseFilterMeta,
  mediaType: BrowseFilters["mediaType"],
) {
  return mediaType === "tv" ? meta.tvGenres : meta.movieGenres;
}

export function providerOptionsForMediaType(
  meta: BrowseFilterMeta,
  mediaType: BrowseFilters["mediaType"],
) {
  return mediaType === "tv" ? meta.tvProviders : meta.movieProviders;
}

export function removeBrowseFilterChip(
  filters: BrowseFilters,
  chipKey: string,
): BrowseFilters {
  if (chipKey === "date") {
    return { ...filters, dateFrom: null, dateTo: null };
  }
  if (chipKey.startsWith("lang-")) {
    return { ...filters, language: defaultBrowseLanguage() };
  }
  if (chipKey.startsWith("genre-")) {
    const id = Number(chipKey.slice(6));
    return {
      ...filters,
      genreIds: filters.genreIds.filter((genreId) => genreId !== id),
    };
  }
  if (chipKey.startsWith("ott-")) {
    const id = Number(chipKey.slice(4));
    return {
      ...filters,
      providerIds: filters.providerIds.filter(
        (providerId) => !ottProviderIdsMatch(providerId, id),
      ),
    };
  }
  return filters;
}

/** Single-select: tap active language resets to default; otherwise select that language. */
export function selectLanguage(filters: BrowseFilters, code: string): BrowseFilters {
  const nextLanguage =
    filters.language === code ? defaultBrowseLanguage() : code;

  return { ...filters, language: nextLanguage };
}

export function toggleGenre(filters: BrowseFilters, genreId: number): BrowseFilters {
  const exists = filters.genreIds.includes(genreId);
  return {
    ...filters,
    genreIds: exists
      ? filters.genreIds.filter((id) => id !== genreId)
      : [...filters.genreIds, genreId],
  };
}

export function toggleProvider(filters: BrowseFilters, providerId: number): BrowseFilters {
  const group = findOttPlatformGroup(providerId);
  const exists = filters.providerIds.includes(providerId);

  if (exists) {
    return {
      ...filters,
      providerIds: filters.providerIds.filter((id) => id !== providerId),
    };
  }

  // Variant/alias: one tile per group (e.g. Prime vs Prime with Ads); discover still expands all ids.
  const withoutGroupSiblings =
    group && (group.tier === "alias" || group.tier === "variant")
      ? filters.providerIds.filter((id) => !group.ids.includes(id))
      : filters.providerIds;

  const next = {
    ...filters,
    providerIds: dedupeOttProviderIds([...withoutGroupSiblings, providerId]),
  };
  browseDebug("OTT provider chip toggled", {
    chipProviderId: providerId,
    action: exists ? "removed" : "added",
    providerIds: next.providerIds,
  });
  return next;
}
