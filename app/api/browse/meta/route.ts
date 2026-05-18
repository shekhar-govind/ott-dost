import { browseDebug } from "@/lib/browse/debug";
import { getBrowseFilterMetaCached } from "@/lib/browse/get-filter-meta-cached";
import { NextResponse } from "next/server";

/** Full route response is cached on the server and shared across users (24h). */
export const revalidate = 86_400;

export async function GET() {
  try {
    const meta = await getBrowseFilterMetaCached();

    browseDebug("Browse meta API loaded (daily cache)", {
      movieProviderCount: meta.movieProviders.length,
      tvProviderCount: meta.tvProviders.length,
      languageCount: meta.languages.length,
      movieGenreCount: meta.movieGenres.length,
      tvGenreCount: meta.tvGenres.length,
    });

    return NextResponse.json(meta, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Could not load filter options" }, { status: 502 });
  }
}
