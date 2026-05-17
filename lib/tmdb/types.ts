export type TmdbMediaType = "movie" | "tv";

export interface TmdbSearchResult {
  id: number;
  media_type?: TmdbMediaType | "person";
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview?: string;
  poster_path?: string | null;
  release_date?: string;
  first_air_date?: string;
}

export interface TmdbSearchResponse {
  page: number;
  results: TmdbSearchResult[];
  total_pages: number;
  total_results: number;
}

export interface TmdbDiscoverMovieResult {
  id: number;
  title: string;
  overview?: string;
  poster_path?: string | null;
  release_date?: string;
  genre_ids?: number[];
}

export interface TmdbDiscoverTvResult {
  id: number;
  name: string;
  overview?: string;
  poster_path?: string | null;
  first_air_date?: string;
}

export interface TmdbDiscoverResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface SearchTitle {
  id: number;
  mediaType: TmdbMediaType;
  title: string;
  year: string | null;
  releaseDate: string | null;
  overview: string;
  posterUrl: string | null;
  /** Subscription OTT platform names in India (flatrate) */
  streamOn: string[];
  genres: string[];
}

export interface TmdbWatchProvidersApiResponse {
  id: number;
  results?: Record<string, TmdbWatchProvidersResult>;
}

export interface BrowsePage {
  items: SearchTitle[];
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface StreamingProvider {
  id: number;
  name: string;
  logoUrl: string | null;
}

export interface WatchAvailability {
  stream: StreamingProvider[];
  rent: StreamingProvider[];
  buy: StreamingProvider[];
}

export interface TitleDetail {
  id: number;
  mediaType: TmdbMediaType;
  title: string;
  year: string | null;
  overview: string;
  posterUrl: string | null;
  rating: number | null;
  voteCount: number | null;
  runtime: string | null;
  genres: string[];
  status: string | null;
  watchAvailability: WatchAvailability;
}

interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbWatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
}

export interface TmdbWatchProvidersResult {
  link?: string;
  flatrate?: TmdbWatchProvider[];
  rent?: TmdbWatchProvider[];
  buy?: TmdbWatchProvider[];
}

export interface TmdbMovieDetails {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date?: string;
  vote_average: number;
  vote_count: number;
  runtime: number | null;
  genres: TmdbGenre[];
  status?: string;
  "watch/providers"?: {
    results?: Record<string, TmdbWatchProvidersResult>;
  };
}

export interface TmdbTvDetails {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  number_of_seasons: number;
  episode_run_time: number[];
  genres: TmdbGenre[];
  status: string;
  "watch/providers"?: {
    results?: Record<string, TmdbWatchProvidersResult>;
  };
}
