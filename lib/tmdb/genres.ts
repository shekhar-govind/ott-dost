import { TMDB_API_BASE } from "./constants";
import { getTmdbApiKey } from "./utils";

interface TmdbGenreListResponse {
  genres: { id: number; name: string }[];
}

let movieGenreMap: Map<number, string> | null = null;

export async function getMovieGenreMap(): Promise<Map<number, string>> {
  if (movieGenreMap) {
    return movieGenreMap;
  }

  const params = new URLSearchParams({
    api_key: getTmdbApiKey(),
    language: "en-IN",
  });

  const response = await fetch(`${TMDB_API_BASE}/genre/movie/list?${params}`, {
    next: { revalidate: 86_400 },
  });

  if (!response.ok) {
    throw new Error(`TMDB genre list failed: ${response.status}`);
  }

  const data = (await response.json()) as TmdbGenreListResponse;
  movieGenreMap = new Map(data.genres.map((genre) => [genre.id, genre.name]));

  return movieGenreMap;
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
