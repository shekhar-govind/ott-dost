import { getMovieWatchProviders } from "./client";
import type { SearchTitle } from "./types";
import { getStreamProviderNames } from "./utils";

export async function enrichWithStreamProviders(
  items: SearchTitle[],
): Promise<SearchTitle[]> {
  return Promise.all(
    items.map(async (item) => {
      try {
        const providers = await getMovieWatchProviders(item.id);
        return {
          ...item,
          streamOn: getStreamProviderNames(providers),
        };
      } catch {
        return { ...item, streamOn: [] };
      }
    }),
  );
}
