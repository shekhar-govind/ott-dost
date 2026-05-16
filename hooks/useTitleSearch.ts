"use client";

import { fetchSearchResults } from "@/lib/api/search";
import type { SearchTitle } from "@/lib/tmdb/types";
import { useEffect, useState } from "react";

const MIN_QUERY_LENGTH = 2;

interface UseTitleSearchResult {
  results: SearchTitle[];
  isLoading: boolean;
  error: string | null;
}

export function useTitleSearch(query: string): UseTitleSearchResult {
  const [results, setResults] = useState<SearchTitle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    fetchSearchResults(trimmed, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setResults(data);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setResults([]);
          setError("Could not load results. Try again.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [query]);

  return { results, isLoading, error };
}
