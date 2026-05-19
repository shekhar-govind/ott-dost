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

const UNDETERMINED_LANGUAGE_CODES = new Set(["xx", "zz"]);

/** TMDB `original_language` (ISO 639-1) → readable label, e.g. `hi` → Hindi */
export function formatOriginalLanguage(
  code: string | null | undefined,
): string | null {
  const trimmed = code?.trim().toLowerCase();
  if (!trimmed || UNDETERMINED_LANGUAGE_CODES.has(trimmed)) return null;

  try {
    const label = new Intl.DisplayNames(["en"], { type: "language" }).of(trimmed);
    if (!label) return trimmed.toUpperCase();
    return label.charAt(0).toUpperCase() + label.slice(1);
  } catch {
    return trimmed.toUpperCase();
  }
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

function tmdbUserRating(
  voteAverage?: number,
  voteCount?: number,
): { rating: number | null; voteCount: number | null } {
  return {
    rating:
      voteAverage != null && Number.isFinite(voteAverage) && voteAverage > 0
        ? voteAverage
        : null,
    voteCount:
      voteCount != null && Number.isFinite(voteCount) && voteCount > 0
        ? voteCount
        : null,
  };
}

function getReleaseDate(item: TmdbSearchResult): string | null {
  return item.release_date ?? item.first_air_date ?? null;
}

export function toSearchTitle(item: TmdbSearchResult): SearchTitle | null {
  if (!isSearchableMedia(item)) return null;

  const releaseDate = getReleaseDate(item);
  const { rating, voteCount } = tmdbUserRating(
    item.vote_average,
    item.vote_count,
  );

  return {
    id: item.id,
    mediaType: item.media_type,
    title: getDisplayTitle(item),
    year: getReleaseYear(item),
    releaseDate,
    overview: item.overview ?? "",
    posterUrl: getPosterUrl(item.poster_path),
    rating,
    voteCount,
    languageLabel: formatOriginalLanguage(item.original_language),
    streamProviders: [],
    genres: [],
  };
}

export function toSearchTitleFromMovie(
  movie: TmdbDiscoverMovieResult,
  genres: string[] = [],
): SearchTitle {
  const releaseDate = movie.release_date ?? null;
  const { rating, voteCount } = tmdbUserRating(
    movie.vote_average,
    movie.vote_count,
  );

  return {
    id: movie.id,
    mediaType: "movie",
    title: movie.title,
    year: getYearFromDate(releaseDate ?? undefined),
    releaseDate,
    overview: movie.overview ?? "",
    posterUrl: getPosterUrl(movie.poster_path),
    rating,
    voteCount,
    languageLabel: formatOriginalLanguage(movie.original_language),
    streamProviders: [],
    genres,
  };
}

export function toSearchTitleFromTv(
  show: TmdbDiscoverTvResult,
  genres: string[] = [],
): SearchTitle {
  const releaseDate = show.first_air_date ?? null;
  const { rating, voteCount } = tmdbUserRating(
    show.vote_average,
    show.vote_count,
  );

  return {
    id: show.id,
    mediaType: "tv",
    title: show.name,
    year: getYearFromDate(releaseDate ?? undefined),
    releaseDate,
    overview: show.overview ?? "",
    posterUrl: getPosterUrl(show.poster_path),
    rating,
    voteCount,
    languageLabel: formatOriginalLanguage(show.original_language),
    streamProviders: [],
    genres,
  };
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

export function getAlternateTitle(
  title: string,
  originalTitle: string | null | undefined,
): string | null {
  const original = originalTitle?.trim();
  if (!original) return null;
  if (
    original.localeCompare(title.trim(), undefined, { sensitivity: "accent" }) ===
    0
  ) {
    return null;
  }
  return original;
}

export function getTagline(tagline: string | null | undefined): string | null {
  const trimmed = tagline?.trim();
  return trimmed || null;
}

export function formatEpisodeCount(
  count: number | null | undefined,
): string | null {
  if (count == null || !Number.isFinite(count) || count <= 0) return null;
  return count === 1 ? "1 episode" : `${count} episodes`;
}

export function mapNetworkNames(
  networks: { name: string }[] | null | undefined,
): string[] {
  if (!networks?.length) return [];

  const seen = new Set<string>();
  const names: string[] = [];

  for (const network of networks) {
    const name = network.name?.trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    names.push(name);
  }

  return names;
}

export function formatVoteCount(count: number | null | undefined): string | null {
  if (count == null || !Number.isFinite(count) || count <= 0) return null;
  const formatted = new Intl.NumberFormat("en-IN", {
    notation: "compact",
  }).format(count);
  return `${formatted} ratings`;
}

/** Meta row shared by list cards and title summary: type · rating · votes · date · language */
export function buildListMetaLine(parts: {
  mediaType: TmdbMediaType;
  rating: number | null;
  voteCount?: number | null;
  releaseDate: string | null;
  languageLabel: string | null;
}): string {
  return [
    getMediaTypeLabel(parts.mediaType),
    ...(parts.rating !== null ? [`${parts.rating.toFixed(1)} / 10`] : []),
    formatVoteCount(parts.voteCount),
    formatReleaseDate(parts.releaseDate),
    parts.languageLabel,
  ]
    .filter(Boolean)
    .join(" · ");
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

export function getStreamFlatrateProviders(
  response: TmdbWatchProvidersApiResponse,
): StreamingProvider[] {
  const region = response.results?.[WATCH_REGION];
  return mapProviderList(region?.flatrate ?? []);
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
  const releaseDate = movie.release_date ?? null;

  return {
    id: movie.id,
    mediaType: "movie",
    title: movie.title,
    originalTitle: getAlternateTitle(movie.title, movie.original_title),
    tagline: getTagline(movie.tagline),
    year: getYearFromDate(releaseDate ?? undefined),
    releaseDate,
    overview: movie.overview,
    posterUrl: getPosterUrl(movie.poster_path, "w500"),
    rating: movie.vote_average > 0 ? movie.vote_average : null,
    voteCount: movie.vote_count > 0 ? movie.vote_count : null,
    languageLabel: formatOriginalLanguage(movie.original_language),
    runtime: formatRuntime(movie.runtime),
    genres: movie.genres.map((genre) => genre.name),
    status: movie.status ?? null,
    episodeCount: null,
    networkNames: [],
    watchAvailability: mapWatchAvailability(movie),
  };
}

export function toTitleDetailFromTv(show: TmdbTvDetails): TitleDetail {
  const releaseDate = show.first_air_date ?? null;
  const episodeCount =
    show.number_of_episodes != null &&
    Number.isFinite(show.number_of_episodes) &&
    show.number_of_episodes > 0
      ? show.number_of_episodes
      : null;

  return {
    id: show.id,
    mediaType: "tv",
    title: show.name,
    originalTitle: getAlternateTitle(show.name, show.original_name),
    tagline: getTagline(show.tagline),
    year: getYearFromDate(releaseDate ?? undefined),
    releaseDate,
    overview: show.overview,
    posterUrl: getPosterUrl(show.poster_path, "w500"),
    rating: show.vote_average > 0 ? show.vote_average : null,
    voteCount: show.vote_count > 0 ? show.vote_count : null,
    languageLabel: formatOriginalLanguage(show.original_language),
    runtime: formatTvRuntime(show),
    genres: show.genres.map((genre) => genre.name),
    status: show.status || null,
    episodeCount,
    networkNames: mapNetworkNames(show.networks),
    watchAvailability: mapWatchAvailability(show),
  };
}
