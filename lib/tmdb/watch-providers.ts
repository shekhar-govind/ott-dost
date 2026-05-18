import { TMDB_API_BASE } from "./constants";
import { fetchTmdb } from "./fetch";
import { getTmdbApiKey } from "./utils";

interface TmdbProviderListItem {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
}

interface TmdbProviderListResponse {
  results: TmdbProviderListItem[];
}

const WATCH_REGION = "IN";

async function fetchProviderList(endpoint: "movie" | "tv"): Promise<TmdbProviderListItem[]> {
  const params = new URLSearchParams({
    api_key: getTmdbApiKey(),
    watch_region: WATCH_REGION,
  });

  const response = await fetchTmdb(
    `${TMDB_API_BASE}/watch/providers/${endpoint}?${params}`,
    { next: { revalidate: 86_400 } },
  );

  const data = (await response.json()) as TmdbProviderListResponse;
  return data.results ?? [];
}

/** TMDB catalog of streaming providers in India (flatrate-style list). */
export async function getIndiaStreamingProviderCatalog(): Promise<
  Map<number, TmdbProviderListItem>
> {
  const [movieProviders, tvProviders] = await Promise.all([
    fetchProviderList("movie"),
    fetchProviderList("tv"),
  ]);

  const catalog = new Map<number, TmdbProviderListItem>();
  for (const provider of [...movieProviders, ...tvProviders]) {
    if (!catalog.has(provider.provider_id)) {
      catalog.set(provider.provider_id, provider);
    }
  }

  return catalog;
}
