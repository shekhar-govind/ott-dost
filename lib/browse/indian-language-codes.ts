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

const INDIAN_BROWSE_LANGUAGE_CODES = new Set<string>([
  ENGLISH_LANGUAGE_CODE,
  ...INDIAN_OFFICIAL_LANGUAGE_CODES,
]);

export function isIndianBrowseLanguageCode(code: string): boolean {
  return INDIAN_BROWSE_LANGUAGE_CODES.has(code.trim().toLowerCase());
}

/** Valid ISO 639-1/639-2 shape and on the India + English allowlist (for URL + filters). */
export function isAllowedBrowseLanguageCode(code: string): boolean {
  const normalized = code.trim().toLowerCase();
  if (!/^[a-z]{2,3}$/.test(normalized)) return false;
  return isIndianBrowseLanguageCode(normalized);
}
