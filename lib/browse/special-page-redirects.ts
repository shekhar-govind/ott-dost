import { isBrowseSpecialPathname } from "./is-browse-special-path";
import { parseBrowseSpecialPath } from "./path-facets";
import { canonicalizeBrowseSlug } from "./slug-registry";

/**
 * If the pathname uses a slug alias or non-canonical casing, return the
 * canonical special-page path (301 target). Preserves no query string.
 */
export function resolveBrowseSpecialPathRedirect(pathname: string): string | null {
  if (!isBrowseSpecialPathname(pathname)) return null;

  const trimmed = pathname.replace(/\/+$/, "") || "/";
  const parsed = parseBrowseSpecialPath(trimmed);
  if (!parsed) return null;

  const canonicalPath =
    parsed.segments.length === 0
      ? `/${parsed.namespace}`
      : `/${parsed.namespace}/${parsed.segments.join("/")}`;

  if (trimmed === canonicalPath) return null;

  const parts = trimmed.split("/").filter(Boolean);
  const rawSegments = parts.slice(1);

  const aliasOrCasingMismatch =
    rawSegments.length !== parsed.segments.length ||
    rawSegments.some(
      (segment, index) =>
        canonicalizeBrowseSlug(segment) !== parsed.segments[index] ||
        segment !== parsed.segments[index],
    );

  return aliasOrCasingMismatch ? canonicalPath : null;
}
