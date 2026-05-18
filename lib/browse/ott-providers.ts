import { BROWSE_OTT_PROVIDERS } from "./constants";
import type { BrowseOttProvider } from "./types";
import { getIndiaStreamingProviderCatalog } from "@/lib/tmdb/watch-providers";
import { getPosterUrl } from "@/lib/tmdb/utils";

export async function resolveBrowseOttProviders(): Promise<BrowseOttProvider[]> {
  try {
    const catalog = await getIndiaStreamingProviderCatalog();

    return BROWSE_OTT_PROVIDERS.map((provider) => {
      const entry = catalog.get(provider.id);
      return {
        ...provider,
        logoUrl: getPosterUrl(entry?.logo_path ?? null, "w92"),
      };
    });
  } catch {
    return BROWSE_OTT_PROVIDERS.map((provider) => ({
      ...provider,
      logoUrl: null,
    }));
  }
}
