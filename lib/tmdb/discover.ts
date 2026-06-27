import { formatTmdbWithWatchProviders } from "@/lib/browse/ott-platform-normalization";
import type { DiscoverFilters } from "./discover-types";
import { TMDB_WATCH_REGION } from "./watch-providers";

export function appendDiscoverFilters(
  params: URLSearchParams,
  filters: DiscoverFilters,
  mode: "movie" | "tv",
): void {
  params.set("watch_region", TMDB_WATCH_REGION);
  params.set("with_watch_monetization_types", "flatrate|free|ads");

  if (filters.genreIds.length > 0) {
    params.set("with_genres", filters.genreIds.join("|"));
  }

  const dateFrom = filters.dateFrom;
  const dateTo = filters.dateTo;

  if (mode === "movie") {
    if (dateFrom) params.set("primary_release_date.gte", dateFrom);
    if (dateTo) params.set("primary_release_date.lte", dateTo);
  } else {
    if (dateFrom) params.set("first_air_date.gte", dateFrom);
    if (dateTo) params.set("first_air_date.lte", dateTo);
  }

  const watchProviders = formatTmdbWithWatchProviders(filters.providerIds);
  if (watchProviders) {
    params.set("with_watch_providers", watchProviders);
  }

  // Cast/crew filters use /person/{id}/*_credits (see discover-by-person.ts), not discover.
}

export function resolveDateTo(filters: DiscoverFilters): string | undefined {
  const dateTo = filters.dateTo;
  if (dateTo) return dateTo;
  return undefined;
}
