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

function compareBrowseLanguageOptions(a: BrowseLanguageOption, b: BrowseLanguageOption): number {
  if (a.code === ENGLISH_LANGUAGE_CODE) return -1;
  if (b.code === ENGLISH_LANGUAGE_CODE) return 1;
  return a.romanName.localeCompare(b.romanName);
}

/**
 * Map TMDB languages to browse chips: English + Indian official languages only.
 * Display: native script name (roman name).
 */
export function mapTmdbLanguagesToBrowseOptions(
  languages: TmdbConfigurationLanguage[],
): BrowseLanguageOption[] {
  return languages
    .filter((lang) => {
      const code = lang.iso_639_1?.trim().toLowerCase();
      return code && isIndianBrowseLanguageCode(code);
    })
    .map((lang) => {
      const code = lang.iso_639_1.trim().toLowerCase();
      const romanName =
        lang.english_name?.trim() ||
        romanLanguageName(code, lang.name?.trim() || code.toUpperCase());
      const nativeName = nativeLanguageName(
        code,
        lang.name?.trim() || "",
        romanName,
      );

      return { code, nativeName, romanName };
    })
    .sort(compareBrowseLanguageOptions);
}
