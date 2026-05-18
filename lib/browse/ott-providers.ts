import type { BrowseOttProvider } from "./types";
import { listIndiaStreamingProviders } from "@/lib/tmdb/watch-providers";
import { getPosterUrl } from "@/lib/tmdb/utils";

function providerShortLabel(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words
    .slice(0, 3)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export async function resolveBrowseOttProviders(): Promise<BrowseOttProvider[]> {
  const providers = await listIndiaStreamingProviders();

  return providers
    .map((provider, index) => ({
      id: provider.provider_id,
      name: provider.provider_name,
      shortLabel: providerShortLabel(provider.provider_name),
      logoUrl: getPosterUrl(provider.logo_path, "w92"),
      listKey: `${provider.provider_id}-${index}`,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
