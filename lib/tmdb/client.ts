import { TMDB_API_BASE } from "./constants";
import type { TmdbSearchResponse } from "./types";
import { getTmdbApiKey } from "./utils";

export async function searchMulti(query: string): Promise<TmdbSearchResponse> {
  const params = new URLSearchParams({
    api_key: getTmdbApiKey(),
    query: query.trim(),
    include_adult: "false",
    language: "en-IN",
    page: "1",
  });

  const response = await fetch(`${TMDB_API_BASE}/search/multi?${params}`, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`TMDB search failed: ${response.status}`);
  }

  return response.json() as Promise<TmdbSearchResponse>;
}
