import { WATCH_REGION_LABEL } from "@/lib/watch-region";

export function WatchRegionBadge() {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 shadow-sm"
      aria-label={`Watch region: ${WATCH_REGION_LABEL}`}
    >
      <span aria-hidden>🇮🇳</span>
      {WATCH_REGION_LABEL}
    </span>
  );
}
