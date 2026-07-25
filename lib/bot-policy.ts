/** SEO scrapers — blocked site-wide. */
const BLOCKED_SCRAPER_UA =
  /ahrefsbot|semrushbot|mj12bot|dotbot|blexbot|dataforseobot|megaindex|serpstatbot|rogerbot|petalbot|aspiegelbot/i;

/**
 * Social / chat link-preview agents — allowed on title pages so shares still
 * get OG tags. Low volume vs search crawlers.
 */
const SOCIAL_PREVIEW_UA =
  /facebookexternalhit|facebot|twitterbot|linkedinbot|slackbot|discordbot|whatsapp|telegrambot|pinterest|redditbot|embedly|quora link preview|vkshare/i;

/** Search and generic crawlers — blocked on title pages only. */
const CRAWLER_UA =
  /bot|crawl|spider|slurp|mediapartners-google|google-inspectiontool|bingpreview|yandex|baidu|duckduck|applebot|gptbot|claudebot|anthropic|bytespider|ccbot|meta-externalagent|ia_archiver/i;

/** `/movie/550` or `/tv/1396` — id-only probes; app links use slug paths. */
const ID_ONLY_TITLE_PATH = /^\/(?:movie|tv)\/\d+$/;

/** Title detail routes that create on-demand ISR pages. */
const TITLE_DETAIL_PATH = /^\/(?:movie|tv)\/\d+/;

export function isBlockedScraperBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return BLOCKED_SCRAPER_UA.test(userAgent);
}

export function isCrawlerBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  if (SOCIAL_PREVIEW_UA.test(userAgent)) return false;
  return CRAWLER_UA.test(userAgent) || BLOCKED_SCRAPER_UA.test(userAgent);
}

export function isIdOnlyTitlePath(pathname: string): boolean {
  return ID_ONLY_TITLE_PATH.test(pathname);
}

export function isTitleDetailPath(pathname: string): boolean {
  return TITLE_DETAIL_PATH.test(pathname);
}
