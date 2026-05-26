import type { BrowseFilters } from "@/lib/browse/filters";

export interface DiscoverFilters {
  genreIds: number[];
  dateFrom: string | null;
  dateTo: string | null;
  providerIds: number[];
  castPersonId: number | null;
  crewPersonId: number | null;
}

export function toDiscoverFilters(filters: BrowseFilters): DiscoverFilters {
  return {
    genreIds: filters.genreIds,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    providerIds: filters.providerIds,
    castPersonId: filters.castPersonId,
    crewPersonId: filters.crewPersonId,
  };
}
