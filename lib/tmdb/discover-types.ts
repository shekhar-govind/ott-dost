export interface DiscoverFilters {
  genreIds: number[];
  dateFrom: string | null;
  dateTo: string | null;
}

export function toDiscoverFilters(filters: {
  genreIds: number[];
  dateFrom: string | null;
  dateTo: string | null;
}): DiscoverFilters | undefined {
  if (
    filters.genreIds.length === 0 &&
    !filters.dateFrom &&
    !filters.dateTo
  ) {
    return undefined;
  }

  return {
    genreIds: filters.genreIds,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
  };
}
