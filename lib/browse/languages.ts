import type { BrowseLanguageOption } from "./types";

/** ISO 639-1 codes for English + scheduled languages of India (TMDB discover). */
export const BROWSE_LANGUAGE_OPTIONS: BrowseLanguageOption[] = [
  { code: "as", label: "অসম", name: "Assamese" },
  { code: "bn", label: "বাংলা", name: "Bengali" },
  { code: "doi", label: "डोगरी", name: "Dogri" },
  { code: "en", label: "EN", name: "English" },
  { code: "gu", label: "ગુજ", name: "Gujarati" },
  { code: "hi", label: "हिं", name: "Hindi" },
  { code: "kn", label: "ಕನ್ನ", name: "Kannada" },
  { code: "ks", label: "کٲش", name: "Kashmiri" },
  { code: "kok", label: "कों", name: "Konkani" },
  { code: "mai", label: "मैथ", name: "Maithili" },
  { code: "ml", label: "മല", name: "Malayalam" },
  { code: "mni", label: "মৈ", name: "Manipuri" },
  { code: "mr", label: "मर", name: "Marathi" },
  { code: "ne", label: "नेप", name: "Nepali" },
  { code: "or", label: "ଓଡ଼", name: "Odia" },
  { code: "pa", label: "ਪੰਜ", name: "Punjabi" },
  { code: "sa", label: "सं", name: "Sanskrit" },
  { code: "sd", label: "سن", name: "Sindhi" },
  { code: "ta", label: "தமிழ்", name: "Tamil" },
  { code: "te", label: "తెల", name: "Telugu" },
  { code: "ur", label: "اردو", name: "Urdu" },
];

export const BROWSE_LANGUAGE_CODES = BROWSE_LANGUAGE_OPTIONS.map((lang) => lang.code);

export const DEFAULT_BROWSE_LANGUAGE_CODES = ["en", "hi"] as const;

const LANGUAGE_SET = new Set<string>(BROWSE_LANGUAGE_CODES);

export function isBrowseLanguageCode(code: string): boolean {
  return LANGUAGE_SET.has(code);
}

export function getBrowseLanguageOption(code: string): BrowseLanguageOption | undefined {
  return BROWSE_LANGUAGE_OPTIONS.find((lang) => lang.code === code);
}

/** Chip text: native label + English name, e.g. "हिं (Hindi)". */
export function getLanguageChipLabel(lang: BrowseLanguageOption): string {
  if (lang.code === "en") return "English";
  return `${lang.label} (${lang.name})`;
}

export function defaultBrowseLanguageCodes(): string[] {
  return [...DEFAULT_BROWSE_LANGUAGE_CODES];
}
