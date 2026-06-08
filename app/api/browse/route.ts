import { getBrowsePage } from "@/lib/browse/get-browse-page";
import { parseBrowseFiltersFromRequest } from "@/lib/browse/parse-request";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const pageParam = request.nextUrl.searchParams.get("page") ?? "1";
  const page = Number(pageParam);

  if (!Number.isInteger(page) || page < 1) {
    return NextResponse.json({ error: "Invalid page" }, { status: 400 });
  }

  const filters = parseBrowseFiltersFromRequest(request);

  try {
    const data = await getBrowsePage(page, filters);
    return NextResponse.json(data);
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
