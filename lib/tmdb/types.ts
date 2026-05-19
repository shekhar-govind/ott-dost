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
  vote_average?: number;
  vote_count?: number;
  /** ISO 639-1 */
  original_language?: string;
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
  vote_average?: number;
  vote_count?: number;
  /** ISO 639-1 */
  original_language?: string;
}

export interface TmdbDiscoverTvResult {
  id: number;
  name: string;
  overview?: string;
  poster_path?: string | null;
  first_air_date?: string;
  genre_ids?: number[];
  vote_average?: number;
  vote_count?: number;
  /** ISO 639-1 */
  original_language?: string;
}

export interface TmdbDiscoverResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface StreamingProvider {
  id: number;
  name: string;
  logoUrl: string | null;
}

export interface SearchTitle {
  id: number;
  mediaType: TmdbMediaType;
  title: string;
  year: string | null;
  releaseDate: string | null;
  overview: string;
  posterUrl: string | null;
  /** TMDB user score (0–10); null when missing or not yet rated */
  rating: number | null;
  voteCount: number | null;
  /** Human-readable primary language (TMDB original_language) */
  languageLabel: string | null;
  /** Subscription OTT platforms in India (flatrate), with logos */
  streamProviders: StreamingProvider[];
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

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profileUrl: string | null;
}

export interface TmdbCastMember {
  id: number;
  name: string;
  character?: string;
  order?: number;
  profile_path?: string | null;
}

export interface TmdbCrewMember {
  id: number;
  name: string;
  job?: string;
  department?: string;
  profile_path?: string | null;
}

export interface CrewCredit {
  job: string;
  names: string;
}

export interface TmdbCredits {
  cast?: TmdbCastMember[];
  crew?: TmdbCrewMember[];
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
  /** When different from `title` (localized vs original) */
  originalTitle: string | null;
  tagline: string | null;
  year: string | null;
  releaseDate: string | null;
  overview: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  rating: number | null;
  voteCount: number | null;
  languageLabel: string | null;
  runtime: string | null;
  genres: string[];
  status: string | null;
  watchAvailability: WatchAvailability;
  cast: CastMember[];
  crew: CrewCredit[];
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
  original_title?: string;
  tagline?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  /** ISO 639-1 */
  original_language?: string;
  vote_average: number;
  vote_count: number;
  runtime: number | null;
  genres: TmdbGenre[];
  status?: string;
  "watch/providers"?: {
    results?: Record<string, TmdbWatchProvidersResult>;
  };
  credits?: TmdbCredits;
}

export interface TmdbTvDetails {
  id: number;
  name: string;
  original_name?: string;
  tagline?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  first_air_date?: string;
  /** ISO 639-1 */
  original_language?: string;
  vote_average: number;
  vote_count: number;
  number_of_seasons: number;
  episode_run_time: number[];
  genres: TmdbGenre[];
  status: string;
  "watch/providers"?: {
    results?: Record<string, TmdbWatchProvidersResult>;
  };
  credits?: TmdbCredits;
}
