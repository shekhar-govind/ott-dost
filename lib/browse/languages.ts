import type { BrowseLanguageOption } from "./types";

/** Pre-nativeName/romanName meta cache entries (daily cache). */
type LegacyBrowseLanguageOption = {
  code: string;
  label?: string;
  name?: string;
  nativeName?: string;
  romanName?: string;
};

/** Omit TMDB `with_original_language` — discover returns every original language. */
export const BROWSE_LANGUAGE_ALL = "all";

/** Default browse language filter (no `with_original_language` on discover). */
export const DEFAULT_BROWSE_LANGUAGE = BROWSE_LANGUAGE_ALL;

/** @deprecated Use {@link DEFAULT_BROWSE_LANGUAGE} */
export const DEFAULT_BROWSE_LANGUAGE_CODES = [DEFAULT_BROWSE_LANGUAGE] as const;

export function isBrowseLanguageAll(language: string): boolean {
  return language === BROWSE_LANGUAGE_ALL;
}

export function isBrowseLanguageCode(code: string): boolean {
  return /^[a-z]{2}$/.test(code);
}

export function defaultBrowseLanguage(): string {
  return DEFAULT_BROWSE_LANGUAGE;
}

function isBrokenNativeName(nativeName: string, romanName: string): boolean {
  const trimmed = nativeName.trim();
  if (!trimmed) return true;
  if (/^[?\s.]+$/.test(trimmed)) return true;
  return trimmed.toLowerCase() === romanName.toLowerCase();
}

export function normalizeBrowseLanguageOption(
  lang: BrowseLanguageOption | LegacyBrowseLanguageOption,
): BrowseLanguageOption {
  const legacy = lang as LegacyBrowseLanguageOption;
  const romanName =
    legacy.romanName?.trim() ||
    legacy.name?.trim() ||
    lang.code.toUpperCase();

  let nativeName = legacy.nativeName?.trim() || legacy.label?.trim() || "";
  if (isBrokenNativeName(nativeName, romanName)) {
    try {
      const fromIntl = new Intl.DisplayNames([lang.code], { type: "language" }).of(
        lang.code,
      );
      nativeName = fromIntl && !isBrokenNativeName(fromIntl, romanName) ? fromIntl : romanName;
    } catch {
      nativeName = romanName;
    }
  }

  return { code: lang.code, nativeName, romanName };
}

export function normalizeBrowseLanguageOptions(
  languages: (BrowseLanguageOption | LegacyBrowseLanguageOption)[],
): BrowseLanguageOption[] {
  return languages.map(normalizeBrowseLanguageOption);
}

export function findBrowseLanguageOption(
  languages: (BrowseLanguageOption | LegacyBrowseLanguageOption)[],
  code: string,
): BrowseLanguageOption | undefined {
  const match = languages.find((lang) => lang.code === code);
  return match ? normalizeBrowseLanguageOption(match) : undefined;
}

/** Chip text: native script (roman), e.g. "हिन्दी (Hindi)". */
export function getLanguageChipLabel(
  lang: BrowseLanguageOption | LegacyBrowseLanguageOption,
): string {
  const { code, nativeName, romanName } = normalizeBrowseLanguageOption(lang);

  if (
    code === "en" ||
    nativeName.toLowerCase() === romanName.toLowerCase()
  ) {
    return romanName;
  }
  return `${nativeName} (${romanName})`;
}

/** @deprecated Use {@link defaultBrowseLanguage} */
export function defaultBrowseLanguageCodes(): string[] {
  return [DEFAULT_BROWSE_LANGUAGE];
}
