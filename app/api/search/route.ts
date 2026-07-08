import {
  SEARCH_API_STALE_WHILE_REVALIDATE_SECONDS,
  SEARCH_REVALIDATE_SECONDS,
} from "@/lib/cache-ttl";
import { searchMulti } from "@/lib/tmdb/client";
import { toSearchTitle } from "@/lib/tmdb/utils";
import { NextRequest, NextResponse } from "next/server";

const MIN_QUERY_LENGTH = 2;
const MAX_RESULTS = 8;

/** Shared across users; identical `q` is served from CDN for 1h. */
export const revalidate = 3_600;

const SEARCH_CACHE_CONTROL = `public, s-maxage=${SEARCH_REVALIDATE_SECONDS}, stale-while-revalidate=${SEARCH_API_STALE_WHILE_REVALIDATE_SECONDS}`;

const SEARCH_JSON_HEADERS = {
  "Cache-Control": SEARCH_CACHE_CONTROL,
} as const;

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (query.length < MIN_QUERY_LENGTH) {
    return NextResponse.json({ results: [] }, { headers: SEARCH_JSON_HEADERS });
  }

  try {
    const data = await searchMulti(query);
    const results = data.results
      .map(toSearchTitle)
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .slice(0, MAX_RESULTS);

    return NextResponse.json({ results }, { headers: SEARCH_JSON_HEADERS });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed";

    if (message.includes("TMDB_API_KEY")) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    return NextResponse.json({ error: "Search failed" }, { status: 502 });
  }
}
