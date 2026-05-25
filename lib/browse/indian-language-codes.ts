import { BROWSE_LANGUAGE_ALL } from "./languages";

/**
 * ISO 639-1 codes for languages with official status in India (Constitution, Eighth Schedule)
 * plus English, which is widely used for Indian film/TV metadata on TMDB.
 *
 * Intersect this set with TMDB `/configuration/languages` so chip labels stay in sync
 * with TMDB while the allowlist only changes when India's official language list changes.
 *
 * @see https://en.wikipedia.org/wiki/Eighth_Schedule_to_the_Constitution_of_India
 */
export const INDIAN_OFFICIAL_LANGUAGE_CODES = [
  "as", // Assamese
  "bn", // Bengali
  "brx", // Bodo
  "doi", // Dogri
  "gu", // Gujarati
  "hi", // Hindi
  "kn", // Kannada
  "ks", // Kashmiri
  "kok", // Konkani
  "mai", // Maithili
  "ml", // Malayalam
  "mni", // Manipuri
  "mr", // Marathi
  "ne", // Nepali
  "or", // Odia
  "pa", // Punjabi
  "sa", // Sanskrit
  "sat", // Santali
  "sd", // Sindhi
  "ta", // Tamil
  "te", // Telugu
  "ur", // Urdu
] as const;

export const ENGLISH_LANGUAGE_CODE = "en";

const INDIAN_BROWSE_LANGUAGE_CODES = new Set<string>(INDIAN_OFFICIAL_LANGUAGE_CODES);

export function isIndianBrowseLanguageCode(code: string): boolean {
  return INDIAN_BROWSE_LANGUAGE_CODES.has(code.trim().toLowerCase());
}

/** Non-Indian languages shown as browse filter chips (International section). */
export const EXTRA_BROWSE_LANGUAGE_CODES = ["en", "es", "ko", "ja"] as const;

export function isExtraBrowseLanguageCode(code: string): boolean {
  const normalized = code.trim().toLowerCase();
  return (EXTRA_BROWSE_LANGUAGE_CODES as readonly string[]).includes(normalized);
}

export function isBrowseLanguageChipCode(code: string): boolean {
  const normalized = code.trim().toLowerCase();
  return isIndianBrowseLanguageCode(normalized) || isExtraBrowseLanguageCode(normalized);
}

/** Valid language filter for URL parsing (`all` or a chip language code). */
export function isAllowedBrowseLanguageCode(code: string): boolean {
  const normalized = code.trim().toLowerCase();
  if (normalized === BROWSE_LANGUAGE_ALL) return true;
  return isBrowseLanguageChipCode(normalized);
}
