import { getTitleDetailCached } from "@/lib/get-title-detail-cached";
import type { TmdbMediaType } from "@/lib/tmdb/types";
import { NextRequest, NextResponse } from "next/server";

function parseMediaType(value: string | null): TmdbMediaType | null {
  if (value === "movie" || value === "tv") return value;
  return null;
}

export async function GET(request: NextRequest) {
  const mediaType = parseMediaType(request.nextUrl.searchParams.get("mediaType"));
  const id = Number(request.nextUrl.searchParams.get("id"));

  if (!mediaType || !Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const detail = await getTitleDetailCached(mediaType, id);
  if (!detail?.posterUrl) {
    return NextResponse.json({ error: "Poster not found" }, { status: 404 });
  }

  try {
    const upstream = await fetch(detail.posterUrl);
    if (!upstream.ok) {
      return NextResponse.json({ error: "Poster unavailable" }, { status: 502 });
    }

    const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
    const body = await upstream.arrayBuffer();

    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Poster fetch failed" }, { status: 502 });
  }
}
