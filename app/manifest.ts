import type { MetadataRoute } from "next";
import { SITE_TAGLINE } from "@/lib/watch-region";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OTT Dost",
    short_name: "OTT Dost",
    description: SITE_TAGLINE,
    start_url: "/",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#fafafa",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
