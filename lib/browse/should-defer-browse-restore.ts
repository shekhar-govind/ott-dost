import {
  isBareBrowseUrl,
  loadSavedBrowseFilters,
} from "./filter-persistence";
import { filtersAreEqual, parseBrowseFilters } from "./filters";

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
