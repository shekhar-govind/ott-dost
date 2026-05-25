import { getTitleDetailCached } from "@/lib/get-title-detail-cached";
import {
  buildSharePosterTmdbUrl,
  SHARE_POSTER_TMDB_SIZE,
  type SharePosterTmdbSize,
} from "@/lib/share-poster-url";
import type { TmdbMediaType } from "@/lib/tmdb/types";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

function parseMediaType(value: string | null): TmdbMediaType | null {
  if (value === "movie" || value === "tv") return value;
  return null;
}

function parsePosterSize(value: string | null): SharePosterTmdbSize {
  return value === "w500" ? "w500" : SHARE_POSTER_TMDB_SIZE;
}

export async function GET(request: NextRequest) {
  const mediaType = parseMediaType(request.nextUrl.searchParams.get("mediaType"));
  const id = Number(request.nextUrl.searchParams.get("id"));
  const size = parsePosterSize(request.nextUrl.searchParams.get("size"));

  if (!mediaType || !Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const detail = await getTitleDetailCached(mediaType, id);
  if (!detail?.posterUrl) {
    return NextResponse.json({ error: "Poster not found" }, { status: 404 });
  }

  const tmdbPosterUrl = buildSharePosterTmdbUrl(detail.posterUrl, size);
  const upstream = await fetch(tmdbPosterUrl, {
    next: { revalidate: 86400 },
  });

  if (!upstream.ok) {
    return NextResponse.json({ error: "Poster not found" }, { status: 404 });
  }

  const contentType = upstream.headers.get("content-type") ?? "image/jpeg";

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
