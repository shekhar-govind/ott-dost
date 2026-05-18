import { TMDB_API_BASE } from "./constants";
import { fetchTmdb } from "./fetch";
import { getTmdbApiKey } from "./utils";

interface TmdbGenreListResponse {
  genres: { id: number; name: string }[];
}

let movieGenreMap: Map<number, string> | null = null;
let tvGenreMap: Map<number, string> | null = null;

async function fetchGenreMap(endpoint: string): Promise<Map<number, string>> {
  const params = new URLSearchParams({
    api_key: getTmdbApiKey(),
    language: "en-IN",
  });

  const response = await fetchTmdb(`${TMDB_API_BASE}/${endpoint}?${params}`, {
    next: { revalidate: 86_400 },
  });

  const data = (await response.json()) as TmdbGenreListResponse;
  return new Map(data.genres.map((genre) => [genre.id, genre.name]));
}

export async function getMovieGenreMap(): Promise<Map<number, string>> {
  if (movieGenreMap) {
    return movieGenreMap;
  }

  movieGenreMap = await fetchGenreMap("genre/movie/list");
  return movieGenreMap;
}

export async function getTvGenreMap(): Promise<Map<number, string>> {
  if (tvGenreMap) {
    return tvGenreMap;
  }

  tvGenreMap = await fetchGenreMap("genre/tv/list");
  return tvGenreMap;
}

export function resolveGenreNames(
  genreIds: number[] | undefined,
  genreMap: Map<number, string>,
  limit = 3,
): string[] {
  if (!genreIds?.length) return [];

  return genreIds
    .map((id) => genreMap.get(id))
    .filter((name): name is string => Boolean(name))
    .slice(0, limit);
}
