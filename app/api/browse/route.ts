import {
  browseDebug,
  logBrowseApiResponse,
  summarizeBrowseItem,
} from "@/lib/browse/debug";
import { isBrowseLanguageAll } from "@/lib/browse/languages";
import { parseBrowseFiltersFromRequest } from "@/lib/browse/parse-request";
import {
  discoverLatestMovies,
  discoverLatestTv,
} from "@/lib/tmdb/client";
import { toDiscoverFilters } from "@/lib/tmdb/discover-types";
import { getMovieGenreMap, getTvGenreMap, resolveGenreNames } from "@/lib/tmdb/genres";
import type {
  TmdbDiscoverResponse,
  TmdbDiscoverMovieResult,
  TmdbDiscoverTvResult,
} from "@/lib/tmdb/types";
import {
  compareByReleaseDateDesc,
  toSearchTitleFromMovie,
  toSearchTitleFromTv,
} from "@/lib/tmdb/utils";
import { NextRequest, NextResponse } from "next/server";

/** Matches TMDB discover page size (20 results per upstream page). */
const PAGE_SIZE = 20;

type DiscoverResult =
  | TmdbDiscoverResponse<TmdbDiscoverMovieResult>
  | TmdbDiscoverResponse<TmdbDiscoverTvResult>;

export async function GET(request: NextRequest) {
  const pageParam = request.nextUrl.searchParams.get("page") ?? "1";
  const page = Number(pageParam);

  if (!Number.isInteger(page) || page < 1) {
    return NextResponse.json({ error: "Invalid page" }, { status: 400 });
  }

  const filters = parseBrowseFiltersFromRequest(request);
  const isMovie = filters.mediaType === "movie";
  const discoverFilters = toDiscoverFilters(filters);
  const originalLanguage = isBrowseLanguageAll(filters.language)
    ? null
    : filters.language;

  browseDebug("Browse API received", {
    page,
    mediaType: filters.mediaType,
    providerIds: filters.providerIds,
    discoverFilters,
  });

  try {
    const [discoverResponse, genreMap] = await Promise.all([
      isMovie
        ? discoverLatestMovies(page, originalLanguage, discoverFilters)
        : discoverLatestTv(page, originalLanguage, discoverFilters),
      isMovie ? getMovieGenreMap() : getTvGenreMap(),
    ]);

    const candidates = mapDiscoverResults(discoverResponse, genreMap, isMovie)
      .sort(compareByReleaseDateDesc)
      .slice(0, PAGE_SIZE);

    const items = candidates;

    browseDebug("Browse API returning items", {
      page,
      itemCount: items.length,
      items: items.map(summarizeBrowseItem),
    });

    const hasMore = page < discoverResponse.total_pages;
    const payload = {
      items,
      page,
      totalPages: discoverResponse.total_pages,
      hasMore,
    };

    logBrowseApiResponse("response", {
      ...payload,
      items: items.map(summarizeBrowseItem),
    });

    return NextResponse.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Browse failed";

    if (message.includes("TMDB_API_KEY")) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    return NextResponse.json({ error: "Browse failed" }, { status: 502 });
  }
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
