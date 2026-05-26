import { browseDebug } from "@/lib/browse/debug";
import type { BrowseFilters } from "@/lib/browse/filters";
import { serializeBrowseFilters } from "@/lib/browse/filters";
import type { BrowseFilterMeta } from "@/lib/browse/types";
import type { BrowseWatchProviderEntry } from "@/lib/browse/watch-provider-entry";
import type { BrowsePage, TmdbMediaType } from "@/lib/tmdb/types";

export interface BrowseWatchProvidersBatchItem {
  id: number;
  mediaType: TmdbMediaType;
}

export interface BrowseWatchProvidersBatchResult {
  entries: Record<string, BrowseWatchProviderEntry>;
}

export async function fetchBrowseWatchProviders(
  items: BrowseWatchProvidersBatchItem[],
  signal?: AbortSignal,
): Promise<BrowseWatchProvidersBatchResult> {
  if (items.length === 0) return { entries: {} };

  const response = await fetch("/api/browse/watch-providers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
    signal,
  });

  if (!response.ok) {
    throw new Error("Watch providers request failed");
  }

  const data = (await response.json()) as {
    providers?: Record<string, BrowseWatchProviderEntry["providers"]>;
    hasRentOrBuy?: Record<string, boolean>;
  };

  const providers = data.providers ?? {};
  const hasRentOrBuy = data.hasRentOrBuy ?? {};
  const entries: Record<string, BrowseWatchProviderEntry> = {};

  for (const key of new Set([...Object.keys(providers), ...Object.keys(hasRentOrBuy)])) {
    entries[key] = {
      providers: providers[key] ?? [],
      hasRentOrBuy: hasRentOrBuy[key] ?? false,
    };
  }

  return { entries };
}

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

  return (await response.json()) as BrowsePage;
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
