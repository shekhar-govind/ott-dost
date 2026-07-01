export type TmdbMediaType = "movie" | "tv";

export interface TmdbPerson {
  id: number;
  name: string;
}

/** Title row from `/person/{id}/movie_credits` or `/person/{id}/tv_credits`. */
export interface TmdbPersonCreditItem {
  id: number;
  name?: string;
  title?: string;
  first_air_date?: string;
  release_date?: string;
  genre_ids?: number[];
  poster_path?: string | null;
  overview?: string;
  vote_average?: number;
  vote_count?: number;
  original_language?: string;
}

export interface TmdbPersonTvCredits {
  id: number;
  cast: TmdbPersonCreditItem[];
  crew: TmdbPersonCreditItem[];
}

export interface TmdbPersonMovieCredits {
  id: number;
  cast: TmdbPersonCreditItem[];
  crew: TmdbPersonCreditItem[];
}

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

export interface CrewCreditMember {
  id: number;
  name: string;
}

export interface CrewCredit {
  job: string;
  members: CrewCreditMember[];
  /** When more people exist for this job than we show. */
  extraCount?: number;
}

export interface TmdbCredits {
  cast?: TmdbCastMember[];
  crew?: TmdbCrewMember[];
}

export interface TmdbRecommendationResult {
  id: number;
  media_type?: TmdbMediaType;
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
  original_language?: string;
}

export interface TmdbRecommendations {
  results?: TmdbRecommendationResult[];
}

export type WatchStreamSource = "watch_providers" | "network";

export interface WatchAvailability {
  stream: StreamingProvider[];
  rent: StreamingProvider[];
  buy: StreamingProvider[];
  /** Present when stream providers were inferred from TV networks. */
  streamSource?: WatchStreamSource;
}

export interface TmdbNetwork {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country?: string;
}

export interface TmdbVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official?: boolean;
  published_at?: string;
}

export interface TmdbVideos {
  results?: TmdbVideo[];
}

export interface TitleTrailer {
  name: string;
  youtubeKey: string;
  thumbnailUrl: string;
  youtubeUrl: string;
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
  /** India certification from TMDB (e.g. U, UA, A) when available */
  ageRating: string | null;
  languageLabel: string | null;
  runtime: string | null;
  genres: string[];
  status: string | null;
  watchAvailability: WatchAvailability;
  cast: CastMember[];
  crew: CrewCredit[];
  recommendations: SearchTitle[];
  trailer: TitleTrailer | null;
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
  free?: TmdbWatchProvider[];
  ads?: TmdbWatchProvider[];
  rent?: TmdbWatchProvider[];
  buy?: TmdbWatchProvider[];
}

export interface TmdbReleaseDateEntry {
  certification?: string;
  release_date?: string;
  type?: number;
}

export interface TmdbReleaseDatesByCountry {
  iso_3166_1: string;
  release_dates: TmdbReleaseDateEntry[];
}

export interface TmdbReleaseDates {
  results?: TmdbReleaseDatesByCountry[];
}

export interface TmdbContentRating {
  iso_3166_1: string;
  rating: string;
}

export interface TmdbContentRatings {
  results?: TmdbContentRating[];
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
  release_dates?: TmdbReleaseDates;
  "watch/providers"?: {
    results?: Record<string, TmdbWatchProvidersResult>;
  };
  credits?: TmdbCredits;
  recommendations?: TmdbRecommendations;
  videos?: TmdbVideos;
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
  networks?: TmdbNetwork[];
  origin_country?: string[];
  content_ratings?: TmdbContentRatings;
  "watch/providers"?: {
    results?: Record<string, TmdbWatchProvidersResult>;
  };
  credits?: TmdbCredits;
  recommendations?: TmdbRecommendations;
  videos?: TmdbVideos;
}
