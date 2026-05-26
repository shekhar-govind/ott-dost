import type { StreamingProvider } from "@/lib/tmdb/types";

export interface BrowseWatchProviderEntry {
  providers: StreamingProvider[];
  hasRentOrBuy: boolean;
}
