import type { MetadataRoute } from "next";

/** Beta: replace with allow rules when launching publicly. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
