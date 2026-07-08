/** Browse list ISR, `/api/browse`, and TMDB discover TTL — 12 hours. */
export const BROWSE_REVALIDATE_SECONDS = 43_200;

/** Title page ISR and TMDB detail TTL — 24 hours. */
export const TITLE_REVALIDATE_SECONDS = 86_400;

/** CDN `stale-while-revalidate` for `/api/browse` JSON responses. */
export const BROWSE_API_STALE_WHILE_REVALIDATE_SECONDS = 3_600;
