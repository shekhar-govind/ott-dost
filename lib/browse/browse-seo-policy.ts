import { isBrowseSpecialPathname } from "./is-browse-special-path";

/** Home URLs with any query string consolidate to `/` and should not be indexed. */
export function shouldNoindexHomeBrowseUrl(
  pathname: string,
  search: string,
): boolean {
  if (pathname !== "/") return false;
  const query = search.startsWith("?") ? search.slice(1) : search;
  return query.length > 0;
}

/** Special pages with query refinements are noindex; canonical stays on the path. */
export function shouldNoindexSpecialBrowseUrl(
  pathname: string,
  search: string,
): boolean {
  if (!isBrowseSpecialPathname(pathname)) return false;
  const query = search.startsWith("?") ? search.slice(1) : search;
  return query.length > 0;
}

export function shouldNoindexBrowseUrl(pathname: string, search: string): boolean {
  return (
    shouldNoindexHomeBrowseUrl(pathname, search) ||
    shouldNoindexSpecialBrowseUrl(pathname, search)
  );
}

export const BROWSE_NOINDEX_HEADER = "noindex, follow";
