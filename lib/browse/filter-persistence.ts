import {
  DEFAULT_BROWSE_MEDIA_TYPE,
  hasNonDefaultBrowseFilters,
  parseBrowseFilters,
  serializeBrowseFilters,
  type BrowseFilters,
} from "./filters";

const STORAGE_KEY = "ott-dost:browse-filters";

/** Home URL with no meaningful filter query — safe to restore saved prefs. */
export function isBareBrowseUrl(searchParams: URLSearchParams): boolean {
  const keys = [...searchParams.keys()];
  if (keys.length === 0) return true;
  return keys.length === 1 && searchParams.get("type") === "movie";
}

export function loadSavedBrowseFilters(): BrowseFilters | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return parseBrowseFilters(new URLSearchParams(raw));
  } catch {
    return null;
  }
}

/** True when the user has chosen something worth restoring later. */
export function shouldPersistBrowseFilters(filters: BrowseFilters): boolean {
  if (hasNonDefaultBrowseFilters(filters)) return true;
  return filters.mediaType !== DEFAULT_BROWSE_MEDIA_TYPE;
}

export function persistBrowseFilters(filters: BrowseFilters): void {
  if (typeof window === "undefined") return;
  try {
    if (!shouldPersistBrowseFilters(filters)) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    const query = serializeBrowseFilters(filters);
    localStorage.setItem(STORAGE_KEY, query);
  } catch {
    // Private mode / quota — ignore
  }
}

export function clearSavedBrowseFilters(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
