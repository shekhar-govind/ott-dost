import {
  ENGLISH_LANGUAGE_CODE,
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
  if (a.code === ENGLISH_LANGUAGE_CODE) return -1;
  if (b.code === ENGLISH_LANGUAGE_CODE) return 1;
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

/**
 * Map TMDB languages to browse chips: Indian official languages first, then all
 * other ISO 639-1 languages from TMDB configuration.
 */
export function mapTmdbLanguagesToBrowseOptions(
  languages: TmdbConfigurationLanguage[],
): BrowseLanguageOption[] {
  const indian: BrowseLanguageOption[] = [];
  const other: BrowseLanguageOption[] = [];
  const seen = new Set<string>();

  for (const lang of languages) {
    const option = mapTmdbLanguageToBrowseOption(lang);
    if (!option || seen.has(option.code)) continue;
    seen.add(option.code);

    if (isIndianBrowseLanguageCode(option.code)) {
      indian.push(option);
    } else {
      other.push(option);
    }
  }

  indian.sort(compareIndianBrowseLanguageOptions);
  other.sort((a, b) => a.romanName.localeCompare(b.romanName));

  return [...indian, ...other];
}

export function splitBrowseLanguageSections(languages: BrowseLanguageOption[]): {
  indian: BrowseLanguageOption[];
  other: BrowseLanguageOption[];
} {
  const splitIndex = languages.findIndex(
    (language) => !isIndianBrowseLanguageCode(language.code),
  );
  if (splitIndex === -1) {
    return { indian: languages, other: [] };
  }
  return {
    indian: languages.slice(0, splitIndex),
    other: languages.slice(splitIndex),
  };
}
