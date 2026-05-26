import type { BrowseFilters } from "./filters";
import { languageMatchesDefault } from "./filters";
import { formatDateFilterChipLabel } from "./date-presets";
import { findBrowseLanguageOption, getLanguageChipLabel } from "./languages";
import { findOttProviderOption } from "./ott-platform-normalization";
import type { BrowseGenreOption, BrowseLanguageOption, BrowseOttProvider } from "./types";

export interface BrowseFilterChip {
  key: string;
  label: string;
}

export interface BrowsePersonFilterChipLabels {
  cast?: { status: "loading" } | { status: "ready"; label: string } | null;
  crew?: { status: "loading" } | { status: "ready"; label: string } | null;
}

export function buildBrowseFilterChips(
  filters: BrowseFilters,
  genreOptions: BrowseGenreOption[],
  languageOptions: BrowseLanguageOption[],
  providerOptions: BrowseOttProvider[],
  personLabels?: BrowsePersonFilterChipLabels,
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
    const provider = findOttProviderOption(providerOptions, providerId);
    chips.push({
      key: `ott-${providerId}`,
      label: `${provider?.name ?? "Platform"} ×`,
    });
  }

  if (
    filters.castPersonId &&
    personLabels?.cast?.status === "ready"
  ) {
    chips.push({
      key: "cast",
      label: `Cast: ${personLabels.cast.label} ×`,
    });
  }

  if (
    filters.crewPersonId &&
    personLabels?.crew?.status === "ready"
  ) {
    chips.push({
      key: "crew",
      label: `Crew: ${personLabels.crew.label} ×`,
    });
  }

  return chips;
}

export { datePresetIdForFilters } from "./date-presets";
