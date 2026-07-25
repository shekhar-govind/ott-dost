import { getSiteBaseUrl, PRIMARY_SITE_URL } from "@/lib/site-url";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteBaseUrl() || PRIMARY_SITE_URL;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Title detail URLs are human-only (middleware also blocks crawlers) to
      // cap ISR writes. Browse SEO lives under /movies/ and /tv-shows/.
      disallow: ["/api/", "/design/", "/movie/", "/tv/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
