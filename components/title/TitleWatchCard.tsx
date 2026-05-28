import type { WatchAvailability } from "@/lib/tmdb/types";
import { TitleSummaryProviders } from "./TitleSummaryProviders";

interface TitleWatchCardProps {
  availability: WatchAvailability;
}

export function TitleWatchCard({ availability }: TitleWatchCardProps) {
  return (
    <article className="mt-3 rounded-2xl border border-zinc-200 bg-zinc-50/80 shadow-none sm:shadow-sm">
      <div className="p-4 sm:p-6">
        <TitleSummaryProviders availability={availability} />
      </div>
    </article>
  );
}
