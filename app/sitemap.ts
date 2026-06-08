import { listIndexableBrowsePaths } from "@/lib/browse/isr-allowlist";
import { getSiteBaseUrl } from "@/lib/site-url";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteBaseUrl() || "https://ott-dost.com";

  const browseEntries: MetadataRoute.Sitemap = listIndexableBrowsePaths().map(
    (path) => ({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: path === "/" ? 1 : 0.8,
    }),
  );

  const staticEntries: MetadataRoute.Sitemap = ["/privacy", "/disclaimer"].map(
    (path) => ({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    }),
  );

  return [...browseEntries, ...staticEntries];
}
