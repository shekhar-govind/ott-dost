import {
  browseDebug,
  logBrowseApiResponse,
  summarizeBrowseItem,
} from "@/lib/browse/debug";
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

  const requestUrl = `/api/browse?${params}`;
  browseDebug("Browse API request", {
    page,
    providerIds: filters.providerIds,
    ottQueryParam: params.get("ott"),
    requestUrl,
    filters,
  });

  const response = await fetch(requestUrl, { signal });

  if (!response.ok) {
    throw new Error("Browse request failed");
  }

  const data = (await response.json()) as BrowsePage;
  logBrowseApiResponse("response", {
    page: data.page,
    totalPages: data.totalPages,
    itemCount: data.items.length,
    hasMore: data.hasMore,
    items: data.items.map(summarizeBrowseItem),
  });
  browseDebug("Browse API response", data);
  return data;
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
