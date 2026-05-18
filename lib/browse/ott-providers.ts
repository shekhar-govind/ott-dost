import type { BrowseMediaType } from "./filters";
import type { BrowseOttProvider } from "./types";
import { getIndiaWatchProvidersForMediaType } from "@/lib/tmdb/watch-providers";
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

function mapTmdbProviders(
  providers: Awaited<ReturnType<typeof getIndiaWatchProvidersForMediaType>>,
): BrowseOttProvider[] {
  return providers.map((provider) => ({
    id: provider.provider_id,
    name: provider.provider_name,
    shortLabel: providerShortLabel(provider.provider_name),
    logoUrl: getPosterUrl(provider.logo_path, "w92"),
  }));
}

export async function resolveBrowseOttProvidersForMediaType(
  mediaType: BrowseMediaType,
): Promise<BrowseOttProvider[]> {
  const providers = await getIndiaWatchProvidersForMediaType(mediaType);
  return mapTmdbProviders(providers);
}

export async function resolveBrowseOttProviderMeta(): Promise<{
  movieProviders: BrowseOttProvider[];
  tvProviders: BrowseOttProvider[];
}> {
  const [movieProviders, tvProviders] = await Promise.all([
    getIndiaWatchProvidersForMediaType("movie"),
    getIndiaWatchProvidersForMediaType("tv"),
  ]);

  return {
    movieProviders: mapTmdbProviders(movieProviders),
    tvProviders: mapTmdbProviders(tvProviders),
  };
}
