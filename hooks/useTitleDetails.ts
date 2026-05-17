"use client";

import { fetchTitleDetails } from "@/lib/api/title";
import type { SearchTitle, TitleDetail } from "@/lib/tmdb/types";
import { useEffect, useState } from "react";

interface UseTitleDetailsResult {
  detail: TitleDetail | null;
  isLoading: boolean;
  error: string | null;
}

export function useTitleDetails(
  selected: SearchTitle | null,
): UseTitleDetailsResult {
  const [detail, setDetail] = useState<TitleDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selected) {
      setDetail(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    fetchTitleDetails(selected.mediaType, selected.id, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setDetail(data);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setDetail(null);
          setError("Could not load details. Try again.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [selected?.id, selected?.mediaType]);

  return { detail, isLoading, error };
}
