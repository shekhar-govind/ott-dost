import { getTitleDetails } from "@/lib/tmdb/client";
import { toTitleDetailFromMovie, toTitleDetailFromTv } from "@/lib/tmdb/utils";
import type { TmdbMediaType } from "@/lib/tmdb/types";
import { NextRequest, NextResponse } from "next/server";

function isMediaType(value: string | null): value is TmdbMediaType {
  return value === "movie" || value === "tv";
}

export async function GET(request: NextRequest) {
  const mediaType = request.nextUrl.searchParams.get("mediaType");
  const idParam = request.nextUrl.searchParams.get("id");

  if (!isMediaType(mediaType) || !idParam) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const details = await getTitleDetails(mediaType, id);
    const title =
      mediaType === "movie"
        ? toTitleDetailFromMovie(details as Parameters<typeof toTitleDetailFromMovie>[0])
        : toTitleDetailFromTv(details as Parameters<typeof toTitleDetailFromTv>[0]);

    return NextResponse.json({ title });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Details failed";

    if (message.includes("TMDB_API_KEY")) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    return NextResponse.json({ error: "Details failed" }, { status: 502 });
  }
}
