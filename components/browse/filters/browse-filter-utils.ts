import { browseDebug } from "@/lib/browse/debug";
import type { BrowseFilters, BrowseMediaType } from "@/lib/browse/filters";
import { BROWSE_LANGUAGE_ALL, defaultBrowseLanguage } from "@/lib/browse/languages";
import {
  dedupeOttProviderIds,
  findOttPlatformGroup,
  findOttProviderOption,
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

/** Drop genre and OTT ids that are not valid for the current media type. */
export function sanitizeBrowseFiltersForMediaType(
  filters: BrowseFilters,
  meta: BrowseFilterMeta,
): BrowseFilters {
  const genreOptions = genreOptionsForMediaType(meta, filters.mediaType);
  const providerOptions = providerOptionsForMediaType(meta, filters.mediaType);

  const genreIds = filters.genreIds.filter((genreId) =>
    genreOptions.some((genre) => genre.id === genreId),
  );
  const providerIds = dedupeOttProviderIds(
    filters.providerIds.filter(
      (providerId) => findOttProviderOption(providerOptions, providerId) !== undefined,
    ),
  );

  if (
    genreIds.length === filters.genreIds.length &&
    providerIds.length === filters.providerIds.length &&
    providerIds.every((id, index) => id === filters.providerIds[index])
  ) {
    return filters;
  }

  return { ...filters, genreIds, providerIds };
}

export function applyBrowseMediaTypeChange(
  filters: BrowseFilters,
  mediaType: BrowseMediaType,
  meta: BrowseFilterMeta,
): BrowseFilters {
  if (filters.mediaType === mediaType) return filters;
  return sanitizeBrowseFiltersForMediaType({ ...filters, mediaType }, meta);
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

/** Set the active language filter (`all` or ISO 639-1). */
export function setBrowseLanguageFilter(
  filters: BrowseFilters,
  code: string,
): BrowseFilters {
  return { ...filters, language: code };
}

/** @deprecated Chip UI only — toggles off when the same language is tapped again. */
export function selectLanguage(filters: BrowseFilters, code: string): BrowseFilters {
  if (code === BROWSE_LANGUAGE_ALL) {
    return setBrowseLanguageFilter(filters, BROWSE_LANGUAGE_ALL);
  }

  const nextLanguage =
    filters.language === code ? defaultBrowseLanguage() : code;

  return setBrowseLanguageFilter(filters, nextLanguage);
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
