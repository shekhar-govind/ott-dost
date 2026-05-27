/** Canonical production host (apex, no www). */
export const PRIMARY_SITE_HOST = "ott-dost.com";

/** Canonical production origin (HTTPS, no trailing slash). */
export const PRIMARY_SITE_URL = `https://${PRIMARY_SITE_HOST}`;

/**
 * Alternate hosts that 308-redirect to {@link PRIMARY_SITE_HOST} at DNS/CDN.
 * Not used in canonical, OG, or share URLs.
 */
export const REDIRECT_ALTERNATE_HOSTS = [
  "www.ott-dost.com",
  "ott-dost.in",
  "www.ott-dost.in",
] as const;

/**
 * Public site origin for absolute URLs (canonical, OG, share).
 * Prefers `NEXT_PUBLIC_SITE_URL`, then production default, else empty in dev.
 */
export function getSiteBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === "production") return PRIMARY_SITE_URL;
  return "";
}

/** Origin for Next.js `metadataBase` (always a valid URL). */
export function getMetadataBaseUrl(): string {
  const base = getSiteBaseUrl();
  if (base) return base;
  return process.env.NODE_ENV === "production"
    ? PRIMARY_SITE_URL
    : "http://localhost:3000";
}

export function isAlternateProductionHost(host: string): boolean {
  return (REDIRECT_ALTERNATE_HOSTS as readonly string[]).includes(host);
}

/** Vercel preview and local dev should not be forced to the production apex. */
export function isPreviewOrLocalHost(host: string): boolean {
  return host === "localhost" || host.endsWith(".vercel.app");
}
