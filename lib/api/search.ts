import type { SearchTitle } from "@/lib/tmdb/types";

interface SearchApiResponse {
  results: SearchTitle[];
}

export async function fetchSearchResults(
  query: string,
  signal?: AbortSignal,
): Promise<SearchTitle[]> {
  const params = new URLSearchParams({ q: query.trim() });
  const response = await fetch(`/api/search?${params}`, { signal });

  if (!response.ok) {
    throw new Error("Search request failed");
  }

  const data = (await response.json()) as SearchApiResponse;
  return data.results;
}
