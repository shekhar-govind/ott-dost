import { browseDebug } from "@/lib/browse/debug";
import { DEFAULT_BROWSE_FILTERS, type BrowseFilters } from "@/lib/browse/filters";
import { defaultBrowseLanguage } from "@/lib/browse/languages";
import type { BrowseFilterMeta } from "@/lib/browse/types";

export function genreOptionsForMediaType(
  meta: BrowseFilterMeta,
  mediaType: BrowseFilters["mediaType"],
) {
  if (mediaType === "movie") return meta.movieGenres;
  if (mediaType === "tv") return meta.tvGenres;

  const merged = new Map<number, string>();
  for (const genre of [...meta.movieGenres, ...meta.tvGenres]) {
    merged.set(genre.id, genre.name);
  }
  return [...merged.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function removeBrowseFilterChip(
  filters: BrowseFilters,
  chipKey: string,
): BrowseFilters {
  if (chipKey === "type-tv" || chipKey === "type-movie") {
    return { ...filters, mediaType: DEFAULT_BROWSE_FILTERS.mediaType };
  }
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
      providerIds: filters.providerIds.filter((providerId) => providerId !== id),
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
  const exists = filters.providerIds.includes(providerId);
  const next = {
    ...filters,
    providerIds: exists
      ? filters.providerIds.filter((id) => id !== providerId)
      : [...filters.providerIds, providerId],
  };
  browseDebug("OTT provider chip toggled", {
    chipProviderId: providerId,
    action: exists ? "removed" : "added",
    providerIds: next.providerIds,
  });
  return next;
}
