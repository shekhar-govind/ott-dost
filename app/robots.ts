import { getSiteBaseUrl, PRIMARY_SITE_URL } from "@/lib/site-url";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteBaseUrl() || PRIMARY_SITE_URL;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/design/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
