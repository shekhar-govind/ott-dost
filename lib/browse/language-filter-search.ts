import { getLanguageChipLabel } from "./languages";
import type { BrowseLanguageOption } from "./types";

export function languageOptionMatchesQuery(
  option: BrowseLanguageOption,
  query: string,
): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  const label = getLanguageChipLabel(option).toLowerCase();
  return (
    option.code.includes(normalized) ||
    label.includes(normalized) ||
    option.romanName.toLowerCase().includes(normalized) ||
    option.nativeName.toLowerCase().includes(normalized)
  );
}

export function allLanguagesOptionMatchesQuery(query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return (
    normalized === "all" ||
    "all languages".includes(normalized) ||
    "languages".startsWith(normalized)
  );
}

export function filterBrowseLanguageSections(
  indian: BrowseLanguageOption[],
  other: BrowseLanguageOption[],
  query: string,
): {
  indian: BrowseLanguageOption[];
  other: BrowseLanguageOption[];
  showAll: boolean;
} {
  if (!query.trim()) {
    return { indian, other, showAll: true };
  }

  return {
    indian: indian.filter((option) => languageOptionMatchesQuery(option, query)),
    other: other.filter((option) => languageOptionMatchesQuery(option, query)),
    showAll: allLanguagesOptionMatchesQuery(query),
  };
}
