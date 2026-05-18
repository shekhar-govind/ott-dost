"use client";

import { fetchBrowseFilterMeta } from "@/lib/api/browse";
import type { BrowseFilterMeta } from "@/lib/browse/types";
import { useEffect, useState } from "react";

const EMPTY_META: BrowseFilterMeta = {
  movieGenres: [],
  tvGenres: [],
  providers: [],
  languages: [],
};

export function useBrowseFilterMeta(enabled: boolean) {
  const [meta, setMeta] = useState<BrowseFilterMeta>(EMPTY_META);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    setIsLoading(true);

    fetchBrowseFilterMeta(controller.signal)
      .then(setMeta)
      .catch(() => {
        if (!controller.signal.aborted) setMeta(EMPTY_META);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [enabled]);

  return { meta, isLoading };
}
