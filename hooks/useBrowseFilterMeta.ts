"use client";

import { fetchBrowseFilterMeta } from "@/lib/api/browse";
import { browseDebug } from "@/lib/browse/debug";
import { normalizeBrowseLanguageOptions } from "@/lib/browse/languages";
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
      .then((loadedMeta) => {
        browseDebug("Filter meta loaded (OTT chip options)", {
          providers: loadedMeta.providers.map((provider) => ({
            id: provider.id,
            name: provider.name,
          })),
        });
        setMeta({
          ...loadedMeta,
          languages: normalizeBrowseLanguageOptions(loadedMeta.languages),
        });
      })
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
