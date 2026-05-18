import type { SearchTitle } from "@/lib/tmdb/types";

export function browseItemKey(item: Pick<SearchTitle, "mediaType" | "id">): string {
  return `${item.mediaType}-${item.id}`;
}

/** Dedupe by mediaType+id; later pages win so enriched data stays fresh. */
export function mergeBrowseItems(
  existing: SearchTitle[],
  incoming: SearchTitle[],
): SearchTitle[] {
  if (incoming.length === 0) return existing;

  const merged = new Map<string, SearchTitle>();
  for (const item of existing) {
    merged.set(browseItemKey(item), item);
  }
  for (const item of incoming) {
    merged.set(browseItemKey(item), item);
  }
  return [...merged.values()];
}
