/** SEO scrapers and aggressive crawlers — not search/preview bots we want. */
const BLOCKED_SCRAPER_UA =
  /ahrefsbot|semrushbot|mj12bot|dotbot|blexbot|dataforseobot|megaindex|serpstatbot|rogerbot|petalbot|aspiegelbot/i;

/** `/movie/550` or `/tv/1396` — id-only probes; app links use slug paths. */
const ID_ONLY_TITLE_PATH = /^\/(?:movie|tv)\/\d+$/;

export function isBlockedScraperBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return BLOCKED_SCRAPER_UA.test(userAgent);
}

export function isIdOnlyTitlePath(pathname: string): boolean {
  return ID_ONLY_TITLE_PATH.test(pathname);
}
