import { searchMulti } from "@/lib/tmdb/client";
import { toSearchTitle } from "@/lib/tmdb/utils";
import { NextRequest, NextResponse } from "next/server";

const MIN_QUERY_LENGTH = 2;
const MAX_RESULTS = 8;

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (query.length < MIN_QUERY_LENGTH) {
    return NextResponse.json({ results: [] });
  }

  try {
    const data = await searchMulti(query);
    const results = data.results
      .map(toSearchTitle)
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .slice(0, MAX_RESULTS);

    return NextResponse.json({ results });
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
