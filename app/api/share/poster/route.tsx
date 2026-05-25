import { ImageResponse } from "next/og";
import { getTitleDetailCached } from "@/lib/get-title-detail-cached";
import type { TmdbMediaType } from "@/lib/tmdb/types";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const CANVAS = 1200;

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

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#27272a",
        }}
      >
        <img
          src={detail.posterUrl}
          alt=""
          style={{
            maxHeight: "100%",
            maxWidth: "100%",
            objectFit: "contain",
          }}
        />
      </div>
    ),
    {
      width: CANVAS,
      height: CANVAS,
      headers: {
        "Cache-Control": "public, max-age=86400, immutable",
      },
    },
  );
}
