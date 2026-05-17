"use client";

import { useTitleDetails } from "@/hooks/useTitleDetails";
import type { SearchTitle } from "@/lib/tmdb/types";
import { TitleSummary } from "./TitleSummary";
import { TitleSummarySkeleton } from "./TitleSummarySkeleton";

interface TitleSummaryPanelProps {
  selected: SearchTitle | null;
}

export function TitleSummaryPanel({ selected }: TitleSummaryPanelProps) {
  const { detail, isLoading, error } = useTitleDetails(selected);

  if (!selected) return null;

  if (isLoading) {
    return <TitleSummarySkeleton />;
  }

  if (error) {
    return (
      <div
        className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:px-6"
        role="alert"
      >
        {error}
      </div>
    );
  }

  if (!detail) return null;

  return <TitleSummary detail={detail} />;
}
