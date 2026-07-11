/**
 * Home browse sitemap entries.
 *
 * `/` is a single static ISR document (default movies, 3d ISR).
 * Filtered browse is not expressed as separate home URLs — query variants
 * (`/?type=tv`, `/?ott=8`, …) share that cached shell and are noindexed;
 * indexable keyword pages live under `/movies/…` and `/tv-shows/…`.
 */
export function listIndexableBrowsePaths(): string[] {
  return ["/"];
}
