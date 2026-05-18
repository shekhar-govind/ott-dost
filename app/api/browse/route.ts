import { languagesMatchDefault } from "@/lib/browse/filters";
import { expandProviderFilterIds } from "@/lib/browse/provider-aliases";
import { parseBrowseFiltersFromRequest } from "@/lib/browse/parse-request";
import { BROWSE_LANGUAGE_OPTIONS } from "@/lib/browse/languages";
import {
  discoverLatestMovies,
  discoverLatestTv,
} from "@/lib/tmdb/client";
import { toDiscoverFilters } from "@/lib/tmdb/discover-types";
import { enrichWithStreamProviders } from "@/lib/tmdb/enrich-browse";
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

const PAGE_SIZE = 10;
const CANDIDATE_POOL_SIZE = 24;
const CANDIDATE_POOL_SIZE_FILTERED = 40;

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
  const discoverFilters = toDiscoverFilters(filters);
  const mediaKinds =
    filters.mediaType === "all" ? (["movie", "tv"] as const) : ([filters.mediaType] as const);

  const hasStrictFilters =
    filters.providerIds.length > 0 ||
    filters.genreIds.length > 0 ||
    Boolean(filters.dateFrom || filters.dateTo) ||
    !languagesMatchDefault(filters.languages) ||
    filters.languages.length < BROWSE_LANGUAGE_OPTIONS.length;

  const poolSize = hasStrictFilters ? CANDIDATE_POOL_SIZE_FILTERED : CANDIDATE_POOL_SIZE;

  try {
    const discoverTasks = filters.languages.flatMap((language) =>
      mediaKinds.map((kind) =>
        kind === "movie"
          ? discoverLatestMovies(page, language, discoverFilters)
          : discoverLatestTv(page, language, discoverFilters),
      ),
    );

    const [discoverResults, movieGenreMap, tvGenreMap] = await Promise.all([
      Promise.allSettled(discoverTasks),
      getMovieGenreMap(),
      getTvGenreMap(),
    ]);

    const responses = discoverResults
      .filter(
        (result): result is PromiseFulfilledResult<DiscoverResult> =>
          result.status === "fulfilled",
      )
      .map((result) => result.value);

    if (responses.length === 0) {
      throw new Error("Browse failed");
    }

    const providerFilter = expandProviderFilterIds(filters.providerIds);
    const seen = new Set<string>();
    const candidates = responses
      .flatMap((response) =>
        response.results.map((item) => {
          if ("title" in item) {
            return toSearchTitleFromMovie(
              item,
              resolveGenreNames(item.genre_ids, movieGenreMap),
            );
          }
          return toSearchTitleFromTv(
            item,
            resolveGenreNames(item.genre_ids, tvGenreMap),
          );
        }),
      )
      .filter((item) => {
        const key = `${item.mediaType}-${item.id}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort(compareByReleaseDateDesc)
      .slice(0, poolSize);

    const enriched = await enrichWithStreamProviders(candidates);
    const items = enriched
      .filter((item) => item.streamProviders.length > 0)
      .filter(
        (item) =>
          providerFilter.size === 0 ||
          item.streamProviders.some((provider) => providerFilter.has(provider.id)),
      )
      .slice(0, PAGE_SIZE);

    const totalPages = Math.min(...responses.map((response) => response.total_pages));
    const hasMoreFromTmdb = page < totalPages;
    const hasMore =
      items.length > 0
        ? hasMoreFromTmdb
        : filters.providerIds.length > 0
          ? false
          : hasMoreFromTmdb;

    return NextResponse.json({
      items,
      page,
      totalPages,
      hasMore,
    });
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
