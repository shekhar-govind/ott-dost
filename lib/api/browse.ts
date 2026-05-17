import type { BrowsePage } from "@/lib/tmdb/types";

export async function fetchBrowsePage(
  page: number,
  signal?: AbortSignal,
): Promise<BrowsePage> {
  const params = new URLSearchParams({ page: String(page) });
  const response = await fetch(`/api/browse?${params}`, { signal });

  if (!response.ok) {
    throw new Error("Browse request failed");
  }

  return response.json() as Promise<BrowsePage>;
}
