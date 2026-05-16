import { TMDB_IMAGE_BASE } from "./constants";
import type { SearchTitle, TmdbMediaType, TmdbSearchResult } from "./types";

export function getTmdbApiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    throw new Error("TMDB_API_KEY is not set");
  }
  return key;
}

export function getDisplayTitle(item: TmdbSearchResult): string {
  return item.title ?? item.name ?? item.original_title ?? item.original_name ?? "Untitled";
}

export function getReleaseYear(item: TmdbSearchResult): string | null {
  const date = item.release_date ?? item.first_air_date;
  if (!date) return null;
  const year = date.slice(0, 4);
  return year || null;
}

export function getPosterUrl(
  posterPath: string | null | undefined,
  size: "w92" | "w185" | "w500" = "w92",
): string | null {
  if (!posterPath) return null;
  return `${TMDB_IMAGE_BASE}/${size}${posterPath}`;
}

export function isSearchableMedia(
  item: TmdbSearchResult,
): item is TmdbSearchResult & { media_type: TmdbMediaType } {
  return item.media_type === "movie" || item.media_type === "tv";
}

export function toSearchTitle(item: TmdbSearchResult): SearchTitle | null {
  if (!isSearchableMedia(item)) return null;

  return {
    id: item.id,
    mediaType: item.media_type,
    title: getDisplayTitle(item),
    year: getReleaseYear(item),
    overview: item.overview ?? "",
    posterUrl: getPosterUrl(item.poster_path),
  };
}

export function getMediaTypeLabel(mediaType: TmdbMediaType): string {
  return mediaType === "movie" ? "Movie" : "TV";
}
