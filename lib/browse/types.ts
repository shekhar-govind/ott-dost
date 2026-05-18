export interface BrowseLanguageOption {
  code: string;
  /** Language name in its own script, e.g. "हिन्दी". */
  nativeName: string;
  /** Romanized / English name, e.g. "Hindi". */
  romanName: string;
}

export interface BrowseOttProvider {
  id: number;
  name: string;
  shortLabel: string;
  logoUrl: string | null;
}

export interface BrowseGenreOption {
  id: number;
  name: string;
}

export interface BrowseFilterMeta {
  movieGenres: BrowseGenreOption[];
  tvGenres: BrowseGenreOption[];
  /** TMDB `/watch/providers/movie` ids valid for discover `with_watch_providers`. */
  movieProviders: BrowseOttProvider[];
  /** TMDB `/watch/providers/tv` ids valid for discover `with_watch_providers`. */
  tvProviders: BrowseOttProvider[];
  languages: BrowseLanguageOption[];
}
