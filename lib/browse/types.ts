export interface BrowseLanguageOption {
  code: string;
  label: string;
  name: string;
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
  providers: BrowseOttProvider[];
  languages: BrowseLanguageOption[];
}
