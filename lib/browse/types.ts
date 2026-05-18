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
  /** Stable key when the same provider id appears more than once in the master list. */
  listKey?: string;
}

export interface BrowseGenreOption {
  id: number;
  name: string;
}

export interface BrowseFilterMeta {
  movieGenres: BrowseGenreOption[];
  tvGenres: BrowseGenreOption[];
  providers: BrowseOttProvider[];
  languages: BrowseLanguageOption[];
}
