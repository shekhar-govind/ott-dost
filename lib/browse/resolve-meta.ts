import { mapTmdbLanguagesToBrowseOptions } from "./resolve-languages";
import { resolveBrowseOttProviders } from "./ott-providers";
import type { BrowseFilterMeta } from "./types";
import { getTmdbConfigurationLanguages } from "@/lib/tmdb/configuration";
import { getMovieGenreMap, getTvGenreMap } from "@/lib/tmdb/genres";

function mapGenreOptions(genreMap: Map<number, string>) {
  return [...genreMap.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function resolveBrowseFilterMeta(): Promise<BrowseFilterMeta> {
  const [movieGenreMap, tvGenreMap, providers, tmdbLanguages] = await Promise.all([
    getMovieGenreMap(),
    getTvGenreMap(),
    resolveBrowseOttProviders(),
    getTmdbConfigurationLanguages(),
  ]);

  return {
    movieGenres: mapGenreOptions(movieGenreMap),
    tvGenres: mapGenreOptions(tvGenreMap),
    providers,
    languages: mapTmdbLanguagesToBrowseOptions(tmdbLanguages),
  };
}
