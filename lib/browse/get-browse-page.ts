import {
  browseByPersonCredits,
  shouldBrowseViaPersonCredits,
} from "@/lib/browse/discover-by-person";
import { browseDebug } from "@/lib/browse/debug";
import { isBrowseLanguageAll } from "@/lib/browse/languages";
import type { BrowseFilters } from "@/lib/browse/filters";
import {
  discoverLatestMovies,
  discoverLatestTv,
} from "@/lib/tmdb/client";
import { toDiscoverFilters } from "@/lib/tmdb/discover-types";
import { getMovieGenreMap, getTvGenreMap, resolveGenreNames } from "@/lib/tmdb/genres";
import type {
  BrowsePage,
  TmdbDiscoverResponse,
  TmdbDiscoverMovieResult,
  TmdbDiscoverTvResult,
} from "@/lib/tmdb/types";
import {
  compareByReleaseDateDesc,
  toSearchTitleFromMovie,
  toSearchTitleFromTv,
} from "@/lib/tmdb/utils";

/** Matches TMDB discover page size (20 results per upstream page). */
export const BROWSE_PAGE_SIZE = 20;

type DiscoverResult =
  | TmdbDiscoverResponse<TmdbDiscoverMovieResult>
  | TmdbDiscoverResponse<TmdbDiscoverTvResult>;

export async function getBrowsePage(
  page: number,
  filters: BrowseFilters,
): Promise<BrowsePage> {
  if (!Number.isInteger(page) || page < 1) {
    throw new Error("Invalid page");
  }

  const isMovie = filters.mediaType === "movie";
  const discoverFilters = toDiscoverFilters(filters);
  const originalLanguage = isBrowseLanguageAll(filters.language)
    ? null
    : filters.language;

  browseDebug("Browse page fetch", {
    page,
    mediaType: filters.mediaType,
    providerIds: filters.providerIds,
    discoverFilters,
  });

  const genreMap = await (isMovie ? getMovieGenreMap() : getTvGenreMap());

  if (shouldBrowseViaPersonCredits(discoverFilters)) {
    const personBrowse = await browseByPersonCredits(
      filters.mediaType,
      page,
      originalLanguage,
      discoverFilters,
      genreMap,
    );

    browseDebug("Browse page via person credits", {
      mediaType: filters.mediaType,
      page: personBrowse.page,
      castPersonId: discoverFilters.castPersonId,
      crewPersonId: discoverFilters.crewPersonId,
      itemCount: personBrowse.items.length,
    });

    return personBrowse;
  }

  const discoverResponse = isMovie
    ? await discoverLatestMovies(page, originalLanguage, discoverFilters)
    : await discoverLatestTv(page, originalLanguage, discoverFilters);

  const items = mapDiscoverResults(discoverResponse, genreMap, isMovie)
    .sort(compareByReleaseDateDesc)
    .slice(0, BROWSE_PAGE_SIZE);

  return {
    items,
    page,
    totalPages: discoverResponse.total_pages,
    hasMore: page < discoverResponse.total_pages,
  };
}

function mapDiscoverResults(
  response: DiscoverResult,
  genreMap: Map<number, string>,
  isMovie: boolean,
) {
  return response.results.map((item) =>
    isMovie
      ? toSearchTitleFromMovie(
          item as TmdbDiscoverMovieResult,
          resolveGenreNames(item.genre_ids, genreMap),
        )
      : toSearchTitleFromTv(
          item as TmdbDiscoverTvResult,
          resolveGenreNames(item.genre_ids, genreMap),
        ),
  );
}
