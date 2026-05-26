import { expandProviderIdsForDiscover } from "@/lib/browse/ott-platform-normalization";
import {
  getMovieWatchProviders,
  getPersonMovieCredits,
  getPersonTvCredits,
  getTvWatchProviders,
} from "@/lib/tmdb/client";
import { mapWithConcurrency } from "@/lib/tmdb/concurrency";
import type { DiscoverFilters } from "@/lib/tmdb/discover-types";
import type {
  BrowseMediaType,
} from "@/lib/browse/filters";
import type {
  SearchTitle,
  TmdbDiscoverMovieResult,
  TmdbDiscoverTvResult,
  TmdbMediaType,
  TmdbPersonCreditItem,
  TmdbPersonMovieCredits,
  TmdbPersonTvCredits,
} from "@/lib/tmdb/types";
import {
  compareByReleaseDateDesc,
  getStreamFlatrateProviders,
  toSearchTitleFromMovie,
  toSearchTitleFromTv,
} from "@/lib/tmdb/utils";

const PAGE_SIZE = 20;
const WATCH_PROVIDER_CONCURRENCY = 5;

/** Cast/crew browse uses `/person/{id}/*_credits` instead of discover (TV discover ignores person filters). */
export function shouldBrowseViaPersonCredits(filters: DiscoverFilters): boolean {
  return filters.castPersonId != null || filters.crewPersonId != null;
}

function creditReleaseDate(item: TmdbPersonCreditItem): string | null {
  return item.release_date ?? item.first_air_date ?? null;
}

function dedupeCreditsById(items: TmdbPersonCreditItem[]): TmdbPersonCreditItem[] {
  const byId = new Map<number, TmdbPersonCreditItem>();

  for (const item of items) {
    if (!item.id) continue;
    const existing = byId.get(item.id);
    if (!existing) {
      byId.set(item.id, item);
      continue;
    }
    const existingDate = creditReleaseDate(existing);
    const nextDate = creditReleaseDate(item);
    if (
      nextDate &&
      (!existingDate || nextDate.localeCompare(existingDate) > 0)
    ) {
      byId.set(item.id, item);
    }
  }

  return [...byId.values()];
}

function matchesGenreFilter(
  item: TmdbPersonCreditItem,
  genreIds: number[],
): boolean {
  if (genreIds.length === 0) return true;
  const ids = item.genre_ids ?? [];
  return genreIds.some((genreId) => ids.includes(genreId));
}

function matchesDateFilter(
  item: TmdbPersonCreditItem,
  dateFrom: string | null,
  dateTo: string | null,
): boolean {
  const date = creditReleaseDate(item);
  if (!date) return !dateFrom && !dateTo;
  if (dateFrom && date < dateFrom) return false;
  if (dateTo && date > dateTo) return false;
  return true;
}

function matchesLanguageFilter(
  item: TmdbPersonCreditItem,
  originalLanguage: string | null,
): boolean {
  if (!originalLanguage) return true;
  return item.original_language === originalLanguage;
}

function selectCredits(
  credits: TmdbPersonMovieCredits | TmdbPersonTvCredits,
  filters: DiscoverFilters,
): TmdbPersonCreditItem[] {
  if (filters.castPersonId != null) {
    return credits.cast ?? [];
  }
  return credits.crew ?? [];
}

function toDiscoverMovieShape(item: TmdbPersonCreditItem): TmdbDiscoverMovieResult {
  return {
    id: item.id,
    title: item.title ?? item.name ?? "Untitled",
    overview: item.overview,
    poster_path: item.poster_path,
    release_date: item.release_date ?? item.first_air_date,
    genre_ids: item.genre_ids,
    vote_average: item.vote_average,
    vote_count: item.vote_count,
    original_language: item.original_language,
  };
}

function toDiscoverTvShape(item: TmdbPersonCreditItem): TmdbDiscoverTvResult {
  return {
    id: item.id,
    name: item.name ?? item.title ?? "Untitled",
    overview: item.overview,
    poster_path: item.poster_path,
    first_air_date: item.first_air_date ?? item.release_date,
    genre_ids: item.genre_ids,
    vote_average: item.vote_average,
    vote_count: item.vote_count,
    original_language: item.original_language,
  };
}

async function filterCreditsByOttProviders(
  items: TmdbPersonCreditItem[],
  providerIds: number[],
  mediaType: TmdbMediaType,
): Promise<TmdbPersonCreditItem[]> {
  if (providerIds.length === 0) return items;

  const allowedProviderIds = new Set(expandProviderIdsForDiscover(providerIds));

  const checked = await mapWithConcurrency(
    items,
    WATCH_PROVIDER_CONCURRENCY,
    async (item) => {
      const response =
        mediaType === "movie"
          ? await getMovieWatchProviders(item.id)
          : await getTvWatchProviders(item.id);
      const flatrate = getStreamFlatrateProviders(response);
      const matches = flatrate.some((provider) =>
        allowedProviderIds.has(provider.id),
      );
      return matches ? item : null;
    },
  );

  return checked.filter((item): item is TmdbPersonCreditItem => item !== null);
}

function resolveGenreNames(
  genreIds: number[] | undefined,
  genreMap: Map<number, string>,
): string[] {
  if (!genreIds?.length) return [];
  return genreIds
    .map((id) => genreMap.get(id))
    .filter((name): name is string => Boolean(name));
}

export async function browseByPersonCredits(
  mediaType: BrowseMediaType,
  page: number,
  originalLanguage: string | null,
  filters: DiscoverFilters,
  genreMap: Map<number, string>,
): Promise<{
  items: SearchTitle[];
  page: number;
  totalPages: number;
  hasMore: boolean;
}> {
  const personId = filters.castPersonId ?? filters.crewPersonId;
  if (!personId) {
    return { items: [], page: 1, totalPages: 1, hasMore: false };
  }

  const credits =
    mediaType === "movie"
      ? await getPersonMovieCredits(personId)
      : await getPersonTvCredits(personId);

  let candidates = dedupeCreditsById(selectCredits(credits, filters));

  candidates = candidates.filter(
    (item) =>
      matchesGenreFilter(item, filters.genreIds) &&
      matchesDateFilter(item, filters.dateFrom, filters.dateTo) &&
      matchesLanguageFilter(item, originalLanguage),
  );

  candidates = await filterCreditsByOttProviders(
    candidates,
    filters.providerIds,
    mediaType,
  );

  const titles = candidates
    .map((item) => {
      const genres = resolveGenreNames(item.genre_ids, genreMap);
      return mediaType === "movie"
        ? toSearchTitleFromMovie(toDiscoverMovieShape(item), genres)
        : toSearchTitleFromTv(toDiscoverTvShape(item), genres);
    })
    .sort(compareByReleaseDateDesc);

  const totalPages = Math.max(1, Math.ceil(titles.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const items = titles.slice(start, start + PAGE_SIZE);

  return {
    items,
    page: safePage,
    totalPages,
    hasMore: safePage < totalPages,
  };
}
