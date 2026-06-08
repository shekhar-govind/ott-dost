import type { BrowsePage } from "@/lib/tmdb/types";

export interface HomeBrowseSeed {
  initialPage: BrowsePage;
  initialFilterKey: string;
}

let pendingSeed: HomeBrowseSeed | null = null;
let seedConsumed = false;

/** Called during render by the home page seed component (before BrowseList mounts). */
export function setHomeBrowseSeed(seed: HomeBrowseSeed): void {
  if (seedConsumed) return;
  pendingSeed = seed;
}

/** Returns ISR page 1 data once per full page load. */
export function consumeHomeBrowseSeed(): HomeBrowseSeed | null {
  if (seedConsumed || !pendingSeed) return null;
  seedConsumed = true;
  const seed = pendingSeed;
  pendingSeed = null;
  return seed;
}

/** Reset for tests only. */
export function resetHomeBrowseSeedForTests(): void {
  pendingSeed = null;
  seedConsumed = false;
}
