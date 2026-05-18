import type { BrowseFilters } from "@/lib/browse/filters";
import { serializeBrowseFilters } from "@/lib/browse/filters";
import type { BrowseFilterMeta } from "@/lib/browse/types";
import type { BrowsePage } from "@/lib/tmdb/types";

export async function fetchBrowsePage(
  page: number,
  filters: BrowseFilters,
  signal?: AbortSignal,
): Promise<BrowsePage> {
  const params = new URLSearchParams({ page: String(page) });
  const filterQuery = serializeBrowseFilters(filters);
  if (filterQuery) {
    const filterParams = new URLSearchParams(filterQuery);
    filterParams.forEach((value, key) => params.set(key, value));
  }

  const response = await fetch(`/api/browse?${params}`, { signal });

  if (!response.ok) {
    throw new Error("Browse request failed");
  }

  return response.json() as Promise<BrowsePage>;
}

export async function fetchBrowseFilterMeta(
  signal?: AbortSignal,
): Promise<BrowseFilterMeta> {
  const response = await fetch("/api/browse/meta", { signal });

  if (!response.ok) {
    throw new Error("Browse meta request failed");
  }

  return response.json() as Promise<BrowseFilterMeta>;
}
