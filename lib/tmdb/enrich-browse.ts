import { mapWithConcurrency } from "./concurrency";
import { getMovieWatchProviders } from "./client";
import type { SearchTitle } from "./types";
import { getStreamProviderNames } from "./utils";

const WATCH_PROVIDER_CONCURRENCY = 5;

export async function enrichWithStreamProviders(
  items: SearchTitle[],
): Promise<SearchTitle[]> {
  return mapWithConcurrency(items, WATCH_PROVIDER_CONCURRENCY, async (item) => {
    try {
      const providers = await getMovieWatchProviders(item.id);
      return {
        ...item,
        streamOn: getStreamProviderNames(providers),
      };
    } catch {
      return { ...item, streamOn: [] };
    }
  });
}
