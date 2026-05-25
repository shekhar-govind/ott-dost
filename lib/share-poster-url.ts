import type { TmdbMediaType } from "@/lib/tmdb/types";

/** Same-origin poster URL for Web Share file attachment (avoids TMDB CORS). */
export function buildSharePosterProxyPath(
  mediaType: TmdbMediaType,
  id: number,
): string {
  return `/api/share/poster?mediaType=${mediaType}&id=${id}`;
}
