import { dedupeStreamingProvidersForDisplay } from "@/lib/browse/dedupe-stream-providers";
import { browseItemKey } from "@/lib/browse/items";
import { mapWithConcurrency } from "@/lib/tmdb/concurrency";
import {
  getMovieWatchProviders,
  getTvWatchProviders,
} from "@/lib/tmdb/client";
import type { StreamingProvider, TmdbMediaType } from "@/lib/tmdb/types";
import { mapWatchAvailabilityFromWatchProviders } from "@/lib/tmdb/utils";
import { hasRentOrBuyAvailability } from "@/lib/watch/availability-messages";
import { NextRequest, NextResponse } from "next/server";

const MAX_BATCH_SIZE = 25;
const TMDB_CONCURRENCY = 5;

interface WatchProvidersRequestItem {
  id: number;
  mediaType: TmdbMediaType;
}

interface WatchProvidersRequestBody {
  items?: WatchProvidersRequestItem[];
}

export async function POST(request: NextRequest) {
  let body: WatchProvidersRequestBody;

  try {
    body = (await request.json()) as WatchProvidersRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const items = body.items ?? [];

  if (items.length === 0) {
    return NextResponse.json({ providers: {}, hasRentOrBuy: {} });
  }

  if (items.length > MAX_BATCH_SIZE) {
    return NextResponse.json(
      { error: `At most ${MAX_BATCH_SIZE} items per request` },
      { status: 400 },
    );
  }

  const seen = new Set<string>();
  const normalized: WatchProvidersRequestItem[] = [];

  for (const item of items) {
    if (
      !item ||
      typeof item.id !== "number" ||
      !Number.isInteger(item.id) ||
      item.id < 1 ||
      (item.mediaType !== "movie" && item.mediaType !== "tv")
    ) {
      return NextResponse.json({ error: "Invalid item in batch" }, { status: 400 });
    }

    const key = browseItemKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push(item);
  }

  try {
    const pairs = await mapWithConcurrency(
      normalized,
      TMDB_CONCURRENCY,
      async (item) => {
        const response =
          item.mediaType === "movie"
            ? await getMovieWatchProviders(item.id)
            : await getTvWatchProviders(item.id);
        const availability = mapWatchAvailabilityFromWatchProviders(response);
        const providers = dedupeStreamingProvidersForDisplay(availability.stream);
        const hasRentOrBuy = hasRentOrBuyAvailability(availability);
        return [browseItemKey(item), { providers, hasRentOrBuy }] as const;
      },
    );

    const providers: Record<string, StreamingProvider[]> = {};
    const hasRentOrBuy: Record<string, boolean> = {};
    for (const [key, entry] of pairs) {
      providers[key] = entry.providers;
      hasRentOrBuy[key] = entry.hasRentOrBuy;
    }

    return NextResponse.json({ providers, hasRentOrBuy });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Watch providers failed";

    if (message.includes("TMDB_API_KEY")) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    return NextResponse.json({ error: "Watch providers failed" }, { status: 502 });
  }
}
