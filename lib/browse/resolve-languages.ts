import {
  EXTRA_BROWSE_LANGUAGE_CODES,
  isBrowseLanguageChipCode,
  isExtraBrowseLanguageCode,
  isIndianBrowseLanguageCode,
} from "./indian-language-codes";
import type { BrowseLanguageOption } from "./types";
import type { TmdbConfigurationLanguage } from "@/lib/tmdb/configuration";

function romanLanguageName(code: string, englishName: string): string {
  try {
    const label = new Intl.DisplayNames(["en"], { type: "language" }).of(code);
    if (label) return label;
  } catch {
    // fall through
  }
  return englishName;
}

/** TMDB `name` is often "?????" when it lacks a real endonym — do not use those. */
function isUsableTmdbNativeName(tmdbNativeName: string, romanName: string): boolean {
  const trimmed = tmdbNativeName.trim();
  if (!trimmed) return false;
  if (trimmed.toLowerCase() === romanName.toLowerCase()) return false;
  if (/^[?\s.]+$/.test(trimmed)) return false;
  return true;
}

function nativeLanguageName(
  code: string,
  tmdbNativeName: string,
  romanName: string,
): string {
  if (isUsableTmdbNativeName(tmdbNativeName, romanName)) {
    return tmdbNativeName.trim();
  }

  const localesToTry = [code, `${code}-IN`];
  for (const locale of localesToTry) {
    try {
      const label = new Intl.DisplayNames([locale], { type: "language" }).of(code);
      if (label) return label;
    } catch {
      // try next locale
    }
  }

  return romanName;
}

function compareIndianBrowseLanguageOptions(
  a: BrowseLanguageOption,
  b: BrowseLanguageOption,
): number {
  return a.romanName.localeCompare(b.romanName);
}

function mapTmdbLanguageToBrowseOption(
  lang: TmdbConfigurationLanguage,
): BrowseLanguageOption | null {
  const code = lang.iso_639_1?.trim().toLowerCase();
  if (!code || !/^[a-z]{2}$/.test(code)) return null;

  const romanName =
    lang.english_name?.trim() ||
    romanLanguageName(code, lang.name?.trim() || code.toUpperCase());
  const nativeName = nativeLanguageName(code, lang.name?.trim() || "", romanName);

  return { code, nativeName, romanName };
}

const EXTRA_BROWSE_LANGUAGE_ORDER = new Map<string, number>(
  EXTRA_BROWSE_LANGUAGE_CODES.map((code, index) => [code, index]),
);

function compareExtraBrowseLanguageOptions(
  a: BrowseLanguageOption,
  b: BrowseLanguageOption,
): number {
  const orderA = EXTRA_BROWSE_LANGUAGE_ORDER.get(a.code) ?? 99;
  const orderB = EXTRA_BROWSE_LANGUAGE_ORDER.get(b.code) ?? 99;
  return orderA - orderB;
}

export function buildBrowseLanguageChipSections(
  languages: TmdbConfigurationLanguage[],
): {
  languages: BrowseLanguageOption[];
  indianLanguages: BrowseLanguageOption[];
  internationalLanguages: BrowseLanguageOption[];
} {
  const indianLanguages: BrowseLanguageOption[] = [];
  const internationalLanguages: BrowseLanguageOption[] = [];
  const seen = new Set<string>();

  for (const lang of languages) {
    const option = mapTmdbLanguageToBrowseOption(lang);
    if (!option || seen.has(option.code)) continue;
    if (!isBrowseLanguageChipCode(option.code)) continue;
    seen.add(option.code);

    if (isIndianBrowseLanguageCode(option.code)) {
      indianLanguages.push(option);
    } else if (isExtraBrowseLanguageCode(option.code)) {
      internationalLanguages.push(option);
    }
  }

  indianLanguages.sort(compareIndianBrowseLanguageOptions);
  internationalLanguages.sort(compareExtraBrowseLanguageOptions);

  return {
    languages: [...indianLanguages, ...internationalLanguages],
    indianLanguages,
    internationalLanguages,
  };
}

/** @deprecated Use {@link buildBrowseLanguageChipSections} */
export function mapTmdbLanguagesToBrowseOptions(
  languages: TmdbConfigurationLanguage[],
): BrowseLanguageOption[] {
  return buildBrowseLanguageChipSections(languages).languages;
}

export function splitBrowseLanguageSections(languages: BrowseLanguageOption[]): {
  indian: BrowseLanguageOption[];
  other: BrowseLanguageOption[];
} {
  return {
    indian: languages.filter((language) => isIndianBrowseLanguageCode(language.code)),
    other: languages.filter((language) => isExtraBrowseLanguageCode(language.code)),
  };
}
