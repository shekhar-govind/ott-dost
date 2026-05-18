import { unstable_cache } from "next/cache";
import { resolveBrowseFilterMeta } from "./resolve-meta";
import type { BrowseFilterMeta } from "./types";

const SECONDS_PER_DAY = 86_400;

/** Shared across all users; refreshed at most once per day on the server. */
export const getBrowseFilterMetaCached = unstable_cache(
  async (): Promise<BrowseFilterMeta> => resolveBrowseFilterMeta(),
  ["browse-filter-meta", "indian-languages-v4"],
  { revalidate: SECONDS_PER_DAY },
);
