import { buildBrowseLanguageChipSections } from "./resolve-languages";
import { resolveBrowseOttProviderMeta } from "./ott-providers";
import type { BrowseFilterMeta } from "./types";
import { getTmdbConfigurationLanguages } from "@/lib/tmdb/configuration";
import { getMovieGenreMap, getTvGenreMap } from "@/lib/tmdb/genres";

function mapGenreOptions(genreMap: Map<number, string>) {
  return [...genreMap.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function resolveBrowseFilterMeta(): Promise<BrowseFilterMeta> {
  const [movieGenreMap, tvGenreMap, ottProviders, tmdbLanguages] = await Promise.all([
    getMovieGenreMap(),
    getTvGenreMap(),
    resolveBrowseOttProviderMeta(),
    getTmdbConfigurationLanguages(),
  ]);

  const languageSections = buildBrowseLanguageChipSections(tmdbLanguages);

  return {
    movieGenres: mapGenreOptions(movieGenreMap),
    tvGenres: mapGenreOptions(tvGenreMap),
    movieProviders: ottProviders.movieProviders,
    tvProviders: ottProviders.tvProviders,
    languages: languageSections.languages,
    indianLanguages: languageSections.indianLanguages,
    internationalLanguages: languageSections.internationalLanguages,
  };
}
