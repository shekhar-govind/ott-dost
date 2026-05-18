import { TMDB_API_BASE } from "./constants";
import { fetchTmdb } from "./fetch";
import type {
  TmdbDiscoverResponse,
  TmdbDiscoverMovieResult,
  TmdbMediaType,
  TmdbMovieDetails,
  TmdbSearchResponse,
  TmdbTvDetails,
  TmdbWatchProvidersApiResponse,
} from "./types";
import { getTmdbApiKey } from "./utils";

function buildParams(extra?: Record<string, string>) {
  return new URLSearchParams({
    api_key: getTmdbApiKey(),
    language: "en-IN",
    ...extra,
  });
}

export async function searchMulti(query: string): Promise<TmdbSearchResponse> {
  const params = buildParams({
    query: query.trim(),
    include_adult: "false",
    page: "1",
  });

  const response = await fetchTmdb(`${TMDB_API_BASE}/search/multi?${params}`, {
    next: { revalidate: 300 },
  });

  return response.json() as Promise<TmdbSearchResponse>;
}

export async function getTitleDetails(
  mediaType: TmdbMediaType,
  id: number,
): Promise<TmdbMovieDetails | TmdbTvDetails> {
  const params = buildParams({
    append_to_response: "watch/providers",
  });

  const response = await fetchTmdb(
    `${TMDB_API_BASE}/${mediaType}/${id}?${params}`,
    { next: { revalidate: 3600 } },
  );

  return response.json() as Promise<TmdbMovieDetails | TmdbTvDetails>;
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function discoverLatestMovies(
  page: number,
  originalLanguage: string,
): Promise<TmdbDiscoverResponse<TmdbDiscoverMovieResult>> {
  const params = buildParams({
    sort_by: "primary_release_date.desc",
    region: "IN",
    page: String(page),
    include_adult: "false",
    "release_date.lte": todayIsoDate(),
    with_original_language: originalLanguage,
  });

  const response = await fetchTmdb(`${TMDB_API_BASE}/discover/movie?${params}`, {
    next: { revalidate: 3600 },
  });

  return response.json() as Promise<TmdbDiscoverResponse<TmdbDiscoverMovieResult>>;
}

export async function getMovieWatchProviders(
  movieId: number,
): Promise<TmdbWatchProvidersApiResponse> {
  const params = buildParams();

  const response = await fetchTmdb(
    `${TMDB_API_BASE}/movie/${movieId}/watch/providers?${params}`,
    { next: { revalidate: 3600 } },
  );

  return response.json() as Promise<TmdbWatchProvidersApiResponse>;
}
