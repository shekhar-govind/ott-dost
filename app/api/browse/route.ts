import { getBrowsePage } from "@/lib/browse/get-browse-page";
import { parseBrowseFiltersFromRequest } from "@/lib/browse/parse-request";
import {
  BROWSE_API_STALE_WHILE_REVALIDATE_SECONDS,
  BROWSE_REVALIDATE_SECONDS,
} from "@/lib/cache-ttl";
import { NextRequest, NextResponse } from "next/server";

/** Shared across users; aligned with page ISR and TMDB discover TTL (12h). */
export const revalidate = 43_200;

const BROWSE_CACHE_CONTROL = `public, s-maxage=${BROWSE_REVALIDATE_SECONDS}, stale-while-revalidate=${BROWSE_API_STALE_WHILE_REVALIDATE_SECONDS}`;

export async function GET(request: NextRequest) {
  const pageParam = request.nextUrl.searchParams.get("page") ?? "1";
  const page = Number(pageParam);

  if (!Number.isInteger(page) || page < 1) {
    return NextResponse.json({ error: "Invalid page" }, { status: 400 });
  }

  const filters = parseBrowseFiltersFromRequest(request);

  try {
    const data = await getBrowsePage(page, filters);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": BROWSE_CACHE_CONTROL,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Browse failed";

    if (message.includes("TMDB_API_KEY")) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    if (message === "Invalid page") {
      return NextResponse.json({ error: "Invalid page" }, { status: 400 });
    }

    return NextResponse.json({ error: "Browse failed" }, { status: 502 });
  }
}
