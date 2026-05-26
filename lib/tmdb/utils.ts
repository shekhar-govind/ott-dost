import { TMDB_IMAGE_BASE } from "./constants";
import type {
  CastMember,
  CrewCredit,
  CrewCreditMember,
  SearchTitle,
  StreamingProvider,
  TitleDetail,
  TitleTrailer,
  TmdbCredits,
  TmdbDiscoverMovieResult,
  TmdbDiscoverTvResult,
  TmdbMediaType,
  TmdbMovieDetails,
  TmdbRecommendationResult,
  TmdbRecommendations,
  TmdbSearchResult,
  TmdbTvDetails,
  TmdbVideos,
  TmdbWatchProvidersApiResponse,
  WatchAvailability,
} from "./types";

const WATCH_REGION = "IN";
const INDIA_REGION = "IN";
/** TMDB release type: theatrical */
const THEATRICAL_RELEASE_TYPE = 3;

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
  size: "w92" | "w185" | "w500" | "w780" = "w92",
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

export function formatVoteCount(count: number | null | undefined): string | null {
  if (count == null || !Number.isFinite(count) || count <= 0) return null;
  const formatted = new Intl.NumberFormat("en-IN", {
    notation: "compact",
  }).format(count);
  return `${formatted} ratings`;
}

export function extractIndiaAgeRating(
  mediaType: TmdbMediaType,
  details: TmdbMovieDetails | TmdbTvDetails,
): string | null {
  if (mediaType === "movie") {
    return extractMovieIndiaCertification(details as TmdbMovieDetails);
  }
  return extractTvIndiaContentRating(details as TmdbTvDetails);
}

function extractMovieIndiaCertification(movie: TmdbMovieDetails): string | null {
  const india = movie.release_dates?.results?.find(
    (entry) => entry.iso_3166_1 === INDIA_REGION,
  );
  if (!india?.release_dates?.length) return null;

  const withCert = india.release_dates.filter((entry) =>
    entry.certification?.trim(),
  );
  if (!withCert.length) return null;

  const theatrical = [...withCert]
    .reverse()
    .find((entry) => entry.type === THEATRICAL_RELEASE_TYPE);
  const chosen = theatrical ?? withCert[withCert.length - 1];
  return formatIndiaAgeRating(chosen.certification!.trim());
}

function extractTvIndiaContentRating(show: TmdbTvDetails): string | null {
  const india = show.content_ratings?.results?.find(
    (entry) => entry.iso_3166_1 === INDIA_REGION,
  );
  const rating = india?.rating?.trim();
  return rating ? formatIndiaAgeRating(rating) : null;
}

/** Normalize TMDB India certification strings for display (CBFC-style). */
export function formatIndiaAgeRating(value: string): string {
  const normalized = value.trim();
  if (!normalized) return normalized;

  const upper = normalized.toUpperCase();
  if (upper === "U/A") return "UA";

  return normalized;
}

/** Meta row shared by list cards and title summary: type · rating · votes · date · language · age */
export function buildListMetaLine(parts: {
  mediaType: TmdbMediaType;
  rating: number | null;
  voteCount?: number | null;
  releaseDate: string | null;
  languageLabel: string | null;
  ageRating?: string | null;
}): string {
  return [
    getMediaTypeLabel(parts.mediaType),
    ...(parts.rating !== null ? [`${parts.rating.toFixed(1)} / 10`] : []),
    formatVoteCount(parts.voteCount),
    formatReleaseDate(parts.releaseDate),
    parts.languageLabel,
    parts.ageRating,
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

export function mapWatchAvailabilityFromWatchProviders(
  response: TmdbWatchProvidersApiResponse,
): WatchAvailability {
  const region = response.results?.[WATCH_REGION];

  return {
    stream: mapProviderList(region?.flatrate ?? []),
    rent: mapProviderList(region?.rent ?? []),
    buy: mapProviderList(region?.buy ?? []),
  };
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

const TOP_CAST_LIMIT = 10;
const RECOMMENDATIONS_LIMIT = 12;

export function toSearchTitleFromRecommendation(
  item: TmdbRecommendationResult,
  mediaType: TmdbMediaType,
): SearchTitle {
  const releaseDate = item.release_date ?? item.first_air_date ?? null;
  const { rating, voteCount } = tmdbUserRating(
    item.vote_average,
    item.vote_count,
  );
  const resolvedMediaType =
    item.media_type === "movie" || item.media_type === "tv"
      ? item.media_type
      : mediaType;

  return {
    id: item.id,
    mediaType: resolvedMediaType,
    title: getDisplayTitle(item),
    year: getYearFromDate(releaseDate ?? undefined),
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

const TRAILER_TYPE_PRIORITY: Record<string, number> = {
  Trailer: 0,
  Teaser: 1,
};

export function mapTrailer(videos?: TmdbVideos | null): TitleTrailer | null {
  const candidates = (videos?.results ?? []).filter(
    (video) =>
      video.site === "YouTube" &&
      video.key?.trim() &&
      (video.type === "Trailer" || video.type === "Teaser"),
  );

  if (candidates.length === 0) return null;

  const sorted = [...candidates].sort((a, b) => {
    const typeA = TRAILER_TYPE_PRIORITY[a.type] ?? 99;
    const typeB = TRAILER_TYPE_PRIORITY[b.type] ?? 99;
    if (typeA !== typeB) return typeA - typeB;
    if (Boolean(b.official) !== Boolean(a.official)) {
      return Number(b.official) - Number(a.official);
    }
    const dateA = a.published_at ? Date.parse(a.published_at) : 0;
    const dateB = b.published_at ? Date.parse(b.published_at) : 0;
    return dateB - dateA;
  });

  const best = sorted[0];
  const key = best.key.trim();

  return {
    name: best.name?.trim() || "Trailer",
    youtubeKey: key,
    thumbnailUrl: `https://img.youtube.com/vi/${key}/hqdefault.jpg`,
    youtubeUrl: `https://www.youtube.com/watch?v=${key}`,
  };
}

export function mapRecommendations(
  response: TmdbRecommendations | null | undefined,
  mediaType: TmdbMediaType,
  excludeId: number,
): SearchTitle[] {
  const results = response?.results ?? [];
  const items: SearchTitle[] = [];

  for (const raw of results) {
    if (!raw?.id || raw.id === excludeId) continue;
    items.push(toSearchTitleFromRecommendation(raw, mediaType));
    if (items.length >= RECOMMENDATIONS_LIMIT) break;
  }

  return items;
}

const MAIN_CREW_LIMIT = 8;
const MAX_NAMES_PER_JOB = 3;

const CREW_JOB_PRIORITY = [
  "Director",
  "Co-Director",
  "Screenplay",
  "Writer",
  "Screenwriter",
  "Story",
  "Novel",
  "Producer",
  "Executive Producer",
  "Co-Producer",
  "Composer",
  "Original Music Composer",
  "Director of Photography",
  "Editor",
];

function crewJobSortKey(job: string): number {
  const lower = job.toLowerCase();
  const idx = CREW_JOB_PRIORITY.findIndex((label) => label.toLowerCase() === lower);
  return idx === -1 ? 500 : idx;
}

export function mapTopCast(credits?: TmdbCredits | null): CastMember[] {
  const cast = credits?.cast;
  if (!cast?.length) return [];

  return [...cast]
    .filter((member) => member.name?.trim())
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
    .slice(0, TOP_CAST_LIMIT)
    .map((member) => ({
      id: member.id,
      name: member.name.trim(),
      character: member.character?.trim() ?? "",
      profileUrl: getPosterUrl(member.profile_path, "w185"),
    }));
}

export function mapMainCrew(credits?: TmdbCredits | null): CrewCredit[] {
  const crew = credits?.crew;
  if (!crew?.length) return [];

  const membersByJob = new Map<string, CrewCreditMember[]>();

  for (const member of crew) {
    const job = member.job?.trim();
    const name = member.name?.trim();
    if (!job || !name || !member.id) continue;

    const members = membersByJob.get(job) ?? [];
    if (!members.some((entry) => entry.id === member.id)) {
      members.push({ id: member.id, name });
    }
    membersByJob.set(job, members);
  }

  return [...membersByJob.entries()]
    .sort(([jobA], [jobB]) => {
      const byPriority = crewJobSortKey(jobA) - crewJobSortKey(jobB);
      return byPriority !== 0 ? byPriority : jobA.localeCompare(jobB);
    })
    .slice(0, MAIN_CREW_LIMIT)
    .map(([job, members]) => {
      const listed = members.slice(0, MAX_NAMES_PER_JOB);
      const extraCount =
        members.length > MAX_NAMES_PER_JOB
          ? members.length - MAX_NAMES_PER_JOB
          : undefined;
      return {
        job,
        members: listed,
        extraCount,
      };
    });
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
    backdropUrl: getPosterUrl(movie.backdrop_path, "w780"),
    rating: movie.vote_average > 0 ? movie.vote_average : null,
    voteCount: movie.vote_count > 0 ? movie.vote_count : null,
    ageRating: extractIndiaAgeRating("movie", movie),
    languageLabel: formatOriginalLanguage(movie.original_language),
    runtime: formatRuntime(movie.runtime),
    genres: movie.genres.map((genre) => genre.name),
    status: movie.status ?? null,
    watchAvailability: mapWatchAvailability(movie),
    cast: mapTopCast(movie.credits),
    crew: mapMainCrew(movie.credits),
    recommendations: mapRecommendations(
      movie.recommendations,
      "movie",
      movie.id,
    ),
    trailer: mapTrailer(movie.videos),
  };
}

export function toTitleDetailFromTv(show: TmdbTvDetails): TitleDetail {
  const releaseDate = show.first_air_date ?? null;
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
    backdropUrl: getPosterUrl(show.backdrop_path, "w780"),
    rating: show.vote_average > 0 ? show.vote_average : null,
    voteCount: show.vote_count > 0 ? show.vote_count : null,
    ageRating: extractIndiaAgeRating("tv", show),
    languageLabel: formatOriginalLanguage(show.original_language),
    runtime: formatTvRuntime(show),
    genres: show.genres.map((genre) => genre.name),
    status: show.status || null,
    watchAvailability: mapWatchAvailability(show),
    cast: mapTopCast(show.credits),
    crew: mapMainCrew(show.credits),
    recommendations: mapRecommendations(show.recommendations, "tv", show.id),
    trailer: mapTrailer(show.videos),
  };
}
