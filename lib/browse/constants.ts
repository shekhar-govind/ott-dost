export {
  DEFAULT_BROWSE_LANGUAGE_CODES,
  getLanguageChipLabel,
} from "./languages";

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
