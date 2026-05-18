import type { SearchTitle, TmdbMediaType } from "@/lib/tmdb/types";

/**
 * URL segment derived from the display title (cosmetic; lookups use TMDB id + media type).
 */
export function slugifyTitle(title: string): string {
  const trimmed = title.trim();
  const ascii = trimmed
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const slug = ascii
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

  return slug || "title";
}

export function buildTitlePath(
  mediaType: TmdbMediaType,
  id: number,
  title: string,
): string {
  return `/${mediaType}/${id}/${slugifyTitle(title)}`;
}

export function titlePathFromSearchTitle(item: SearchTitle): string {
  return buildTitlePath(item.mediaType, item.id, item.title);
}
