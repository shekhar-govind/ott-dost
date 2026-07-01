import { SHARE_PIPE } from "@/lib/share-payload";

export const SHARE_WATCH_IN_INDIA_CLAUSE = "where to watch in India";

export const SHARE_BRAND_SUFFIX = `${SHARE_WATCH_IN_INDIA_CLAUSE}${SHARE_PIPE}OTT Dost`;

/** Combined media label for browse share copy. */
export const BROWSE_SHARE_MEDIA_LABEL = "movies and TV shows";

/** Default home share line (bare `/`). */
export const SITE_SHARE_HEADLINE = `Find where to watch ${BROWSE_SHARE_MEDIA_LABEL} in India${SHARE_PIPE}OTT Dost`;

export function formatContextualShareHeadline(context: string): string {
  return `${context} - ${SHARE_BRAND_SUFFIX}`;
}

export function shareTitleFromContext(context: string): string {
  if (context.startsWith("Find where to watch ")) {
    return `Find ${context.slice("Find where to watch ".length)}${SHARE_PIPE}OTT Dost`;
  }
  return `${context}${SHARE_PIPE}OTT Dost`;
}
