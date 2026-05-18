import type { DiscoverFilters } from "./discover-types";

export function appendDiscoverFilters(
  params: URLSearchParams,
  filters: DiscoverFilters | undefined,
  mode: "movie" | "tv",
): void {
  if (!filters) return;

  if (filters.genreIds.length > 0) {
    params.set("with_genres", filters.genreIds.join("|"));
  }

  const dateFrom = filters.dateFrom;
  const dateTo = filters.dateTo ?? (mode === "movie" ? undefined : undefined);

  if (mode === "movie") {
    if (dateFrom) params.set("primary_release_date.gte", dateFrom);
    if (dateTo) params.set("primary_release_date.lte", dateTo);
  } else {
    if (dateFrom) params.set("first_air_date.gte", dateFrom);
    if (dateTo) params.set("first_air_date.lte", dateTo);
  }
}

export function resolveDateTo(filters: DiscoverFilters | undefined): string | undefined {
  const dateTo = filters?.dateTo;
  if (dateTo) return dateTo;
  return undefined;
}
