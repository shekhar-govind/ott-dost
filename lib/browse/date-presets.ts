import type { BrowseFilters } from "./filters";

export interface BrowseDatePreset {
  id: string;
  /** Chip label in the filter sheet */
  label: string;
  /** TMDB discover: primary_release_date.gte / first_air_date.gte */
  from: string | null;
  /** TMDB discover: primary_release_date.lte / first_air_date.lte */
  to: string | null;
}

export const BROWSE_CUSTOM_YEAR_MIN = 1930;
export const BROWSE_CUSTOM_YEAR_MAX = 2026;

const INDIA_TIMEZONE = "Asia/Kolkata";

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Calendar date in IST (YYYY-MM-DD), used for browse release-date ceilings. */
export function todayIsoDateInIndia(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: INDIA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/**
 * Sunday ending next calendar week (Monday–Sunday weeks) relative to referenceDate.
 * Example: Sat 2026-05-30 → 2026-06-07.
 */
export function nextCalendarWeekSunday(
  referenceDate = todayIsoDateInIndia(),
): string {
  const date = new Date(`${referenceDate}T12:00:00.000Z`);
  const day = date.getUTCDay();
  const mondayOffset = day === 0 ? 6 : day - 1;
  return addDaysToIsoDate(referenceDate, 13 - mondayOffset);
}

/** Upper bound for TMDB discover: min(user dateTo, next calendar week Sunday). */
export function resolveEffectiveDateTo(
  dateTo: string | null,
  referenceDate = todayIsoDateInIndia(),
): string {
  const ceiling = nextCalendarWeekSunday(referenceDate);
  if (!dateTo || dateTo > ceiling) return ceiling;
  return dateTo;
}

/** Descending years for custom range dropdowns (1930–2026). */
export function getBrowseCustomYearOptions(): number[] {
  const years: number[] = [];
  for (let year = BROWSE_CUSTOM_YEAR_MAX; year >= BROWSE_CUSTOM_YEAR_MIN; year -= 1) {
    years.push(year);
  }
  return years;
}

export function isCustomBrowseDateRangeInvalid(
  fromYear: string,
  toYear: string,
): boolean {
  const from = Number(fromYear);
  const to = Number(toYear);
  if (!Number.isInteger(from) || !Number.isInteger(to)) return true;
  return from > to;
}

export function customBrowseDateRangeFromYears(
  fromYear: string,
  toYear: string,
): Pick<BrowseFilters, "dateFrom" | "dateTo"> {
  return {
    dateFrom: `${fromYear}-01-01`,
    dateTo: `${toYear}-12-31`,
  };
}

function addDaysToIsoDate(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Presets map to TMDB discover date.gte / date.lte (YYYY-MM-DD). */
export function getBrowseDatePresets(referenceDate = todayIsoDate()): BrowseDatePreset[] {
  const year = Number(referenceDate.slice(0, 4));
  const lastYear = year - 1;

  return [
    { id: "any", label: "Any time", from: null, to: null },
    {
      id: "last-30-days",
      label: "Last 30 days",
      from: addDaysToIsoDate(referenceDate, -30),
      to: referenceDate,
    },
    {
      id: "last-6-months",
      label: "Last 6 months",
      from: addDaysToIsoDate(referenceDate, -183),
      to: referenceDate,
    },
    {
      id: "this-year",
      label: "This year",
      from: `${year}-01-01`,
      to: referenceDate,
    },
    {
      id: "last-year",
      label: String(lastYear),
      from: `${lastYear}-01-01`,
      to: `${lastYear}-12-31`,
    },
    {
      id: "2020s",
      label: "2020s",
      from: "2020-01-01",
      to: "2029-12-31",
    },
    {
      id: "2010s",
      label: "2010s",
      from: "2010-01-01",
      to: "2019-12-31",
    },
    {
      id: "2000s",
      label: "2000s",
      from: "2000-01-01",
      to: "2009-12-31",
    },
    {
      id: "before-2000",
      label: "Before 2000",
      from: null,
      to: "1999-12-31",
    },
  ];
}

export function getBrowseDatePreset(
  id: string,
  referenceDate = todayIsoDate(),
): BrowseDatePreset | undefined {
  return getBrowseDatePresets(referenceDate).find((preset) => preset.id === id);
}

export function datesMatchPreset(
  filters: Pick<BrowseFilters, "dateFrom" | "dateTo">,
  preset: BrowseDatePreset,
): boolean {
  return filters.dateFrom === preset.from && filters.dateTo === preset.to;
}

export function datePresetIdForFilters(
  filters: Pick<BrowseFilters, "dateFrom" | "dateTo">,
  referenceDate = todayIsoDate(),
): string {
  if (!filters.dateFrom && !filters.dateTo) return "any";

  const match = getBrowseDatePresets(referenceDate).find((preset) =>
    datesMatchPreset(filters, preset),
  );
  return match?.id ?? "custom";
}

export function formatDateFilterChipLabel(
  filters: Pick<BrowseFilters, "dateFrom" | "dateTo">,
  referenceDate = todayIsoDate(),
): string {
  const presetId = datePresetIdForFilters(filters, referenceDate);
  if (presetId === "any") return "";

  const preset = getBrowseDatePreset(presetId, referenceDate);
  if (preset && presetId !== "custom") {
    return `${preset.label} ×`;
  }

  const fromYear = filters.dateFrom?.slice(0, 4);
  const toYear = filters.dateTo?.slice(0, 4);
  if (fromYear && toYear && fromYear === toYear) {
    return `${fromYear} ×`;
  }
  if (fromYear && toYear) {
    return `${fromYear}–${toYear} ×`;
  }
  if (fromYear) {
    return `From ${fromYear} ×`;
  }
  if (toYear) {
    return `Until ${toYear} ×`;
  }
  return "Date ×";
}

export function applyBrowseDatePreset(
  presetId: string,
  referenceDate = todayIsoDate(),
): Pick<BrowseFilters, "dateFrom" | "dateTo"> {
  const preset = getBrowseDatePreset(presetId, referenceDate);
  if (!preset) {
    return { dateFrom: null, dateTo: null };
  }
  return { dateFrom: preset.from, dateTo: preset.to };
}
