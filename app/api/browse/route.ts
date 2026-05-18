import { discoverLatestMovies } from "@/lib/tmdb/client";
import { BROWSE_LANGUAGES } from "@/lib/tmdb/constants";
import { enrichWithStreamProviders } from "@/lib/tmdb/enrich-browse";
import { getMovieGenreMap, resolveGenreNames } from "@/lib/tmdb/genres";
import type { TmdbDiscoverResponse, TmdbDiscoverMovieResult } from "@/lib/tmdb/types";
import {
  compareByReleaseDateDesc,
  toSearchTitleFromMovie,
} from "@/lib/tmdb/utils";
import { NextRequest, NextResponse } from "next/server";

const PAGE_SIZE = 10;
/** Fetch extra candidates so we can fill a page after OTT-only filtering */
const CANDIDATE_POOL_SIZE = 24;

export async function GET(request: NextRequest) {
  const pageParam = request.nextUrl.searchParams.get("page") ?? "1";
  const page = Number(pageParam);

  if (!Number.isInteger(page) || page < 1) {
    return NextResponse.json({ error: "Invalid page" }, { status: 400 });
  }

  try {
    const [discoverResults, genreMap] = await Promise.all([
      Promise.allSettled(
        BROWSE_LANGUAGES.map((language) => discoverLatestMovies(page, language)),
      ),
      getMovieGenreMap(),
    ]);

    const responses = discoverResults
      .filter(
        (
          result,
        ): result is PromiseFulfilledResult<
          TmdbDiscoverResponse<TmdbDiscoverMovieResult>
        > => result.status === "fulfilled",
      )
      .map((result) => result.value);

    if (responses.length === 0) {
      throw new Error("Browse failed");
    }

    const seen = new Set<string>();
    const candidates = responses
      .flatMap((response) =>
        response.results.map((movie) =>
          toSearchTitleFromMovie(
            movie,
            resolveGenreNames(movie.genre_ids, genreMap),
          ),
        ),
      )
      .filter((item) => {
        const key = String(item.id);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort(compareByReleaseDateDesc)
      .slice(0, CANDIDATE_POOL_SIZE);

    const enriched = await enrichWithStreamProviders(candidates);
    const items = enriched
      .filter((item) => item.streamProviders.length > 0)
      .slice(0, PAGE_SIZE);

    const totalPages = Math.min(...responses.map((response) => response.total_pages));

    return NextResponse.json({
      items,
      page,
      totalPages,
      hasMore: page < totalPages,
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
