/** Browse list ISR, `/api/browse`, and TMDB discover TTL — 3 days. */
export const BROWSE_REVALIDATE_SECONDS = 259_200;

/** Title page ISR and TMDB detail TTL — 7 days. */
export const TITLE_REVALIDATE_SECONDS = 604_800;

/** CDN `stale-while-revalidate` for `/api/browse` JSON responses. */
export const BROWSE_API_STALE_WHILE_REVALIDATE_SECONDS = 3_600;

/** `/api/search` CDN cache and TMDB `search/multi` TTL — 1 hour. */
export const SEARCH_REVALIDATE_SECONDS = 3_600;

/** CDN `stale-while-revalidate` for `/api/search` JSON responses. */
export const SEARCH_API_STALE_WHILE_REVALIDATE_SECONDS = 3_600;
