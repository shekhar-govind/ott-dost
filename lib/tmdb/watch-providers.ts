import { TMDB_API_BASE } from "./constants";
import { fetchTmdb } from "./fetch";
import { getTmdbApiKey } from "./utils";

export interface TmdbProviderListItem {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
}

interface TmdbProviderListResponse {
  results: TmdbProviderListItem[];
}

/** ISO 3166-1 — used for discover `watch_region` and provider list endpoints. */
export const TMDB_WATCH_REGION = "IN";

async function fetchProviderList(
  endpoint: "movie" | "tv",
): Promise<TmdbProviderListItem[]> {
  const params = new URLSearchParams({
    api_key: getTmdbApiKey(),
    watch_region: TMDB_WATCH_REGION,
  });

  const response = await fetchTmdb(
    `${TMDB_API_BASE}/watch/providers/${endpoint}?${params}`,
    { next: { revalidate: 86_400 } },
  );

  const data = (await response.json()) as TmdbProviderListResponse;
  return data.results ?? [];
}

/** Valid `with_watch_providers` ids for discover (matches TMDB filter list for media type). */
export async function getIndiaWatchProvidersForMediaType(
  mediaType: "movie" | "tv",
): Promise<TmdbProviderListItem[]> {
  const providers = await fetchProviderList(mediaType);
  return [...providers].sort((a, b) =>
    a.provider_name.localeCompare(b.provider_name),
  );
}

/** @deprecated Use {@link getIndiaWatchProvidersForMediaType} per media type. */
export async function listIndiaStreamingProviders(): Promise<TmdbProviderListItem[]> {
  const [movieProviders, tvProviders] = await Promise.all([
    fetchProviderList("movie"),
    fetchProviderList("tv"),
  ]);

  return [...movieProviders, ...tvProviders];
}

/** @deprecated Use {@link getIndiaWatchProvidersForMediaType}. */
export async function getIndiaStreamingProviderCatalog(): Promise<
  Map<number, TmdbProviderListItem>
> {
  const providers = await listIndiaStreamingProviders();
  const catalog = new Map<number, TmdbProviderListItem>();

  for (const provider of providers) {
    if (!catalog.has(provider.provider_id)) {
      catalog.set(provider.provider_id, provider);
    }
  }

  return catalog;
}
