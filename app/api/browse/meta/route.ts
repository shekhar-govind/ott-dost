import { BROWSE_LANGUAGE_OPTIONS } from "@/lib/browse/constants";
import { resolveBrowseOttProviders } from "@/lib/browse/ott-providers";
import type { BrowseFilterMeta } from "@/lib/browse/types";
import { getMovieGenreMap, getTvGenreMap } from "@/lib/tmdb/genres";
import { NextResponse } from "next/server";

function mapGenreOptions(genreMap: Map<number, string>) {
  return [...genreMap.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function GET() {
  try {
    const [movieGenreMap, tvGenreMap, providers] = await Promise.all([
      getMovieGenreMap(),
      getTvGenreMap(),
      resolveBrowseOttProviders(),
    ]);

    const meta: BrowseFilterMeta = {
      movieGenres: mapGenreOptions(movieGenreMap),
      tvGenres: mapGenreOptions(tvGenreMap),
      providers,
      languages: BROWSE_LANGUAGE_OPTIONS,
    };

    return NextResponse.json(meta);
  } catch {
    return NextResponse.json({ error: "Could not load filter options" }, { status: 502 });
  }
}
