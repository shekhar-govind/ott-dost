import type { BrowseFilters } from "./filters";
import { languageMatchesDefault } from "./filters";
import { formatDateFilterChipLabel } from "./date-presets";
import { findBrowseLanguageOption, getLanguageChipLabel } from "./languages";
import type { BrowseGenreOption, BrowseLanguageOption, BrowseOttProvider } from "./types";

export interface BrowseFilterChip {
  key: string;
  label: string;
}

export function buildBrowseFilterChips(
  filters: BrowseFilters,
  genreOptions: BrowseGenreOption[],
  languageOptions: BrowseLanguageOption[],
  providerOptions: BrowseOttProvider[],
): BrowseFilterChip[] {
  const chips: BrowseFilterChip[] = [];

  if (!languageMatchesDefault(filters.language)) {
    const lang = findBrowseLanguageOption(languageOptions, filters.language);
    if (lang) {
      chips.push({
        key: `lang-${filters.language}`,
        label: `${getLanguageChipLabel(lang)} ×`,
      });
    }
  }

  if (filters.mediaType === "tv") {
    chips.push({ key: "type-tv", label: "TV ×" });
  } else if (filters.mediaType === "movie") {
    chips.push({ key: "type-movie", label: "Movies ×" });
  }

  for (const genreId of filters.genreIds) {
    const genre = genreOptions.find((g) => g.id === genreId);
    chips.push({
      key: `genre-${genreId}`,
      label: `${genre?.name ?? "Genre"} ×`,
    });
  }

  const dateChipLabel = formatDateFilterChipLabel(filters);
  if (dateChipLabel) {
    chips.push({ key: "date", label: dateChipLabel });
  }

  for (const providerId of filters.providerIds) {
    const provider = providerOptions.find((p) => p.id === providerId);
    chips.push({
      key: `ott-${providerId}`,
      label: `${provider?.name ?? "Platform"} ×`,
    });
  }

  return chips;
}

export { datePresetIdForFilters } from "./date-presets";
