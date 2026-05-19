import type { TitleDetail } from "@/lib/tmdb/types";
import { formatEpisodeCount } from "@/lib/tmdb/utils";

interface TitleSummaryTvFactsProps {
  detail: TitleDetail;
}

export function TitleSummaryTvFacts({ detail }: TitleSummaryTvFactsProps) {
  if (detail.mediaType !== "tv") return null;

  const parts = [
    formatEpisodeCount(detail.episodeCount),
    ...detail.networkNames,
  ].filter(Boolean);

  if (parts.length === 0) return null;

  return (
    <p className="mt-3 text-pretty text-xs text-zinc-500">{parts.join(" · ")}</p>
  );
}
