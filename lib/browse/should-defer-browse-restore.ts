import {
  isBareBrowseUrl,
  loadSavedBrowseFilters,
} from "./filter-persistence";
import {
  filtersAreEqual,
  parseBrowseFilters,
  type BrowseFilters,
} from "./filters";

/** True when saved localStorage filters differ from the current bare home URL. */
export function shouldDeferBrowseRestore(searchQuery: string): boolean {
  const urlParams = new URLSearchParams(searchQuery.startsWith("?") ? searchQuery.slice(1) : searchQuery);

  if (!isBareBrowseUrl(urlParams)) {
    return false;
  }

  const saved = loadSavedBrowseFilters();
  if (!saved) {
    return false;
  }

  const current = parseBrowseFilters(urlParams);
  return !filtersAreEqual(saved, current);
}

/** True once saved filters are reflected in the active browse filter state. */
export function isBrowseRestoreComplete(
  deferInitialData: boolean,
  filters: BrowseFilters,
): boolean {
  if (!deferInitialData) return true;

  const saved = loadSavedBrowseFilters();
  if (!saved) return true;

  return filtersAreEqual(saved, filters);
}
