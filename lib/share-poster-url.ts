import type { TmdbMediaType } from "@/lib/tmdb/types";

/** TMDB size for share poster passthrough (small file, fast fetch). */
export const SHARE_POSTER_TMDB_SIZE = "w185";

export type SharePosterTmdbSize = typeof SHARE_POSTER_TMDB_SIZE | "w500";

/** TMDB poster URL at the given size from a title detail `posterUrl` (w500). */
export function buildSharePosterTmdbUrl(
  posterUrl: string,
  size: SharePosterTmdbSize = SHARE_POSTER_TMDB_SIZE,
): string {
  return posterUrl.replace("/t/p/w500/", `/t/p/${size}/`);
}

/** Same-origin poster URL for Web Share file attachment (avoids TMDB CORS). */
export function buildSharePosterProxyPath(
  mediaType: TmdbMediaType,
  id: number,
  size: SharePosterTmdbSize = SHARE_POSTER_TMDB_SIZE,
): string {
  const params = new URLSearchParams({
    mediaType,
    id: String(id),
  });
  if (size !== SHARE_POSTER_TMDB_SIZE) {
    params.set("size", size);
  }
  return `/api/share/poster?${params.toString()}`;
}

export function buildSharePosterAbsoluteUrl(
  mediaType: TmdbMediaType,
  id: number,
  baseUrl: string,
  size: SharePosterTmdbSize = "w500",
): string {
  const root = baseUrl.replace(/\/$/, "");
  return `${root}${buildSharePosterProxyPath(mediaType, id, size)}`;
}
