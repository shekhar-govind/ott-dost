import type { TitleDetail, TmdbMediaType } from "@/lib/tmdb/types";

interface TitleApiResponse {
  title: TitleDetail;
}

export async function fetchTitleDetails(
  mediaType: TmdbMediaType,
  id: number,
  signal?: AbortSignal,
): Promise<TitleDetail> {
  const params = new URLSearchParams({
    mediaType,
    id: String(id),
  });

  const response = await fetch(`/api/title?${params}`, { signal });

  if (!response.ok) {
    throw new Error("Title details request failed");
  }

  const data = (await response.json()) as TitleApiResponse;
  return data.title;
}
