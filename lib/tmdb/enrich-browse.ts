import { mapWithConcurrency } from "./concurrency";
import { getMovieWatchProviders } from "./client";
import type { SearchTitle } from "./types";
import { getStreamFlatrateProviders } from "./utils";

const WATCH_PROVIDER_CONCURRENCY = 5;

export async function enrichWithStreamProviders(
  items: SearchTitle[],
): Promise<SearchTitle[]> {
  return mapWithConcurrency(items, WATCH_PROVIDER_CONCURRENCY, async (item) => {
    try {
      const providers = await getMovieWatchProviders(item.id);
      return {
        ...item,
        streamProviders: getStreamFlatrateProviders(providers),
      };
    } catch {
      return { ...item, streamProviders: [] };
    }
  });
}
