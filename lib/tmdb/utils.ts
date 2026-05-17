import { TMDB_IMAGE_BASE } from "./constants";
import type {
  SearchTitle,
  StreamingProvider,
  TitleDetail,
  TmdbDiscoverMovieResult,
  TmdbDiscoverTvResult,
  TmdbMediaType,
  TmdbMovieDetails,
  TmdbSearchResult,
  TmdbTvDetails,
  TmdbWatchProvidersApiResponse,
  WatchAvailability,
} from "./types";

const WATCH_REGION = "IN";

export function getTmdbApiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    throw new Error("TMDB_API_KEY is not set");
  }
  return key;
}

export function getDisplayTitle(item: TmdbSearchResult): string {
  return item.title ?? item.name ?? item.original_title ?? item.original_name ?? "Untitled";
}

export function getReleaseYear(item: TmdbSearchResult): string | null {
  const date = item.release_date ?? item.first_air_date;
  if (!date) return null;
  const year = date.slice(0, 4);
  return year || null;
}

export function getYearFromDate(date?: string): string | null {
  if (!date) return null;
  const year = date.slice(0, 4);
  return year || null;
}

export function getPosterUrl(
  posterPath: string | null | undefined,
  size: "w92" | "w185" | "w500" = "w92",
): string | null {
  if (!posterPath) return null;
  return `${TMDB_IMAGE_BASE}/${size}${posterPath}`;
}

export function isSearchableMedia(
  item: TmdbSearchResult,
): item is TmdbSearchResult & { media_type: TmdbMediaType } {
  return item.media_type === "movie" || item.media_type === "tv";
}

function getReleaseDate(item: TmdbSearchResult): string | null {
  return item.release_date ?? item.first_air_date ?? null;
}

export function toSearchTitle(item: TmdbSearchResult): SearchTitle | null {
  if (!isSearchableMedia(item)) return null;

  const releaseDate = getReleaseDate(item);

  return {
    id: item.id,
    mediaType: item.media_type,
    title: getDisplayTitle(item),
    year: getReleaseYear(item),
    releaseDate,
    overview: item.overview ?? "",
    posterUrl: getPosterUrl(item.poster_path),
    streamOn: [],
    genres: [],
  };
}

export function toSearchTitleFromMovie(
  movie: TmdbDiscoverMovieResult,
  genres: string[] = [],
): SearchTitle {
  const releaseDate = movie.release_date ?? null;

  return {
    id: movie.id,
    mediaType: "movie",
    title: movie.title,
    year: getYearFromDate(releaseDate ?? undefined),
    releaseDate,
    overview: movie.overview ?? "",
    posterUrl: getPosterUrl(movie.poster_path),
    streamOn: [],
    genres,
  };
}

export function toSearchTitleFromTv(show: TmdbDiscoverTvResult): SearchTitle {
  const releaseDate = show.first_air_date ?? null;

  return {
    id: show.id,
    mediaType: "tv",
    title: show.name,
    year: getYearFromDate(releaseDate ?? undefined),
    releaseDate,
    overview: show.overview ?? "",
    posterUrl: getPosterUrl(show.poster_path),
    streamOn: [],
    genres: [],
  };
}

export function getStreamProviderNames(
  response: TmdbWatchProvidersApiResponse,
): string[] {
  const region = response.results?.[WATCH_REGION];
  return mapProviderList(region?.flatrate ?? []).map((provider) => provider.name);
}

export function formatStreamOnLabel(streamOn: string[]): string {
  if (streamOn.length === 0) {
    return "Not on any OTT platform";
  }
  return streamOn.join(" · ");
}

export function compareByReleaseDateDesc(a: SearchTitle, b: SearchTitle): number {
  const dateA = a.releaseDate ?? "";
  const dateB = b.releaseDate ?? "";
  if (dateA === dateB) return 0;
  if (!dateA) return 1;
  if (!dateB) return -1;
  return dateB.localeCompare(dateA);
}

export function formatReleaseDate(date: string | null): string | null {
  if (!date) return null;
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getMediaTypeLabel(mediaType: TmdbMediaType): string {
  return mediaType === "movie" ? "Movie" : "TV Series";
}

export function formatRuntime(minutes: number | null | undefined): string | null {
  if (!minutes || minutes <= 0) return null;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function formatTvRuntime(details: TmdbTvDetails): string | null {
  const parts: string[] = [];

  if (details.number_of_seasons > 0) {
    const label = details.number_of_seasons === 1 ? "season" : "seasons";
    parts.push(`${details.number_of_seasons} ${label}`);
  }

  const episodeRuntime = details.episode_run_time?.[0];
  const formatted = formatRuntime(episodeRuntime);
  if (formatted) {
    parts.push(`${formatted} per episode`);
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}

function mapProviderList(
  providers: { provider_id: number; provider_name: string; logo_path: string | null }[],
): StreamingProvider[] {
  const seen = new Set<number>();

  return providers
    .map((provider) => ({
      id: provider.provider_id,
      name: provider.provider_name,
      logoUrl: getPosterUrl(provider.logo_path, "w92"),
    }))
    .filter((provider) => {
      if (seen.has(provider.id)) return false;
      seen.add(provider.id);
      return true;
    });
}

export function mapWatchAvailability(
  details: TmdbMovieDetails | TmdbTvDetails,
): WatchAvailability {
  const region = details["watch/providers"]?.results?.[WATCH_REGION];

  return {
    stream: mapProviderList(region?.flatrate ?? []),
    rent: mapProviderList(region?.rent ?? []),
    buy: mapProviderList(region?.buy ?? []),
  };
}

export function hasWatchAvailability(availability: WatchAvailability): boolean {
  return (
    availability.stream.length > 0 ||
    availability.rent.length > 0 ||
    availability.buy.length > 0
  );
}

export function toTitleDetailFromMovie(movie: TmdbMovieDetails): TitleDetail {
  return {
    id: movie.id,
    mediaType: "movie",
    title: movie.title,
    year: getYearFromDate(movie.release_date),
    overview: movie.overview,
    posterUrl: getPosterUrl(movie.poster_path, "w500"),
    rating: movie.vote_average > 0 ? movie.vote_average : null,
    voteCount: movie.vote_count > 0 ? movie.vote_count : null,
    runtime: formatRuntime(movie.runtime),
    genres: movie.genres.map((genre) => genre.name),
    status: movie.status ?? null,
    watchAvailability: mapWatchAvailability(movie),
  };
}

export function toTitleDetailFromTv(show: TmdbTvDetails): TitleDetail {
  return {
    id: show.id,
    mediaType: "tv",
    title: show.name,
    year: getYearFromDate(show.first_air_date),
    overview: show.overview,
    posterUrl: getPosterUrl(show.poster_path, "w500"),
    rating: show.vote_average > 0 ? show.vote_average : null,
    voteCount: show.vote_count > 0 ? show.vote_count : null,
    runtime: formatTvRuntime(show),
    genres: show.genres.map((genre) => genre.name),
    status: show.status || null,
    watchAvailability: mapWatchAvailability(show),
  };
}
