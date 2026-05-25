"use client";

import { fetchBrowseFilterMeta } from "@/lib/api/browse";
import { browseDebug } from "@/lib/browse/debug";
import { isExtraBrowseLanguageCode } from "@/lib/browse/indian-language-codes";
import { normalizeBrowseLanguageOptions } from "@/lib/browse/languages";
import { splitBrowseLanguageSections } from "@/lib/browse/resolve-languages";
import type { BrowseFilterMeta } from "@/lib/browse/types";
import { useEffect, useState } from "react";

const EMPTY_META: BrowseFilterMeta = {
  movieGenres: [],
  tvGenres: [],
  movieProviders: [],
  tvProviders: [],
  languages: [],
  indianLanguages: [],
  internationalLanguages: [],
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
          movieProviders: loadedMeta.movieProviders.length,
          tvProviders: loadedMeta.tvProviders.length,
        });
        const languages = normalizeBrowseLanguageOptions(loadedMeta.languages);
        const indianLanguages = loadedMeta.indianLanguages?.length
          ? normalizeBrowseLanguageOptions(loadedMeta.indianLanguages)
          : splitBrowseLanguageSections(languages).indian;
        const internationalLanguages = loadedMeta.internationalLanguages?.length
          ? normalizeBrowseLanguageOptions(loadedMeta.internationalLanguages)
          : splitBrowseLanguageSections(languages).other;

        setMeta({
          ...loadedMeta,
          languages,
          indianLanguages,
          internationalLanguages,
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
