import type { BrowseOttProvider } from "./types";

export {
  BROWSE_LANGUAGE_CODES,
  BROWSE_LANGUAGE_OPTIONS,
  DEFAULT_BROWSE_LANGUAGE_CODES,
  getLanguageChipLabel,
} from "./languages";

/** Popular subscription platforms in India (TMDB provider IDs). */
export const BROWSE_OTT_PROVIDERS: BrowseOttProvider[] = [
  { id: 8, name: "Netflix", shortLabel: "N", logoUrl: null },
  { id: 119, name: "Prime Video", shortLabel: "P", logoUrl: null },
  { id: 122, name: "Disney+ Hotstar", shortLabel: "D+", logoUrl: null },
  { id: 232, name: "Zee5", shortLabel: "Z", logoUrl: null },
  { id: 237, name: "SonyLIV", shortLabel: "S", logoUrl: null },
  { id: 350, name: "Apple TV+", shortLabel: "A", logoUrl: null },
  { id: 515, name: "JioHotstar", shortLabel: "J", logoUrl: null },
];

export const BROWSE_DATE_PRESETS = [
  { id: "any", label: "Any time", from: null as string | null, to: null as string | null },
  { id: "2020s", label: "2020s", from: "2020-01-01", to: "2029-12-31" },
  {
    id: "last5",
    label: "Last 5 years",
    from: `${new Date().getFullYear() - 5}-01-01`,
    to: null,
  },
] as const;
