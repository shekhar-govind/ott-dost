"use client";

import { setHomeBrowseSeed } from "@/lib/browse/home-browse-seed";
import type { BrowsePage } from "@/lib/tmdb/types";

interface HomeBrowseInitialSeedProps {
  initialPage: BrowsePage | null;
  initialFilterKey: string | null;
}

/** Registers ISR browse data for the persistent BrowseList in AppMainShell. */
export function HomeBrowseInitialSeed({
  initialPage,
  initialFilterKey,
}: HomeBrowseInitialSeedProps) {
  if (initialPage && initialFilterKey) {
    setHomeBrowseSeed({ initialPage, initialFilterKey });
  }

  return null;
}
