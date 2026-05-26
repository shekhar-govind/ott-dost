import { StreamOnLabel } from "@/components/shared/StreamOnLabel";
import type { BrowseStreamLoadState } from "@/hooks/useBrowseStreamProviders";
import type { StreamingProvider } from "@/lib/tmdb/types";
import { getStreamUnavailableMessageForEmptyStream } from "@/lib/watch/availability-messages";

/** Matches compact {@link StreamOnLabel} footprint; grows when showing empty-state copy. */
export const BROWSE_STREAM_ROW_SLOT_CLASS = "mt-1.5 min-h-[28px] shrink-0";

interface BrowseStreamRowProps {
  providers: StreamingProvider[] | undefined;
  hasRentOrBuy?: boolean;
  loadState: BrowseStreamLoadState;
  isLoading: boolean;
  onRetry?: () => void;
}

function BrowseStreamLoadingPlaceholder() {
  return (
    <div className="flex min-w-0 items-center gap-1.5" aria-busy="true">
      <span className="shrink-0 text-[9px] font-medium uppercase tracking-wide text-zinc-400">
        Streaming on
      </span>
      <span className="flex rounded-md bg-white p-px shadow-sm ring-1 ring-zinc-200/60">
        <span
          className="h-[22px] w-[22px] animate-pulse rounded bg-zinc-200/90 motion-reduce:animate-none"
          aria-hidden
        />
      </span>
    </div>
  );
}

function BrowseStreamEmptyMessage({ hasRentOrBuy }: { hasRentOrBuy: boolean }) {
  return (
    <p className="text-[11px] leading-snug text-zinc-500">
      {getStreamUnavailableMessageForEmptyStream(hasRentOrBuy)}
    </p>
  );
}

function BrowseStreamRetryRow({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <span className="shrink-0 text-[9px] font-medium uppercase tracking-wide text-zinc-400">
        Streaming on
      </span>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onRetry();
        }}
        className="text-[11px] font-medium text-zinc-600 underline decoration-zinc-300 underline-offset-2 transition hover:text-zinc-900"
      >
        Retry
      </button>
    </div>
  );
}

export function BrowseStreamRow({
  providers,
  hasRentOrBuy = false,
  loadState,
  isLoading,
  onRetry,
}: BrowseStreamRowProps) {
  const isLoaded = loadState === "loaded" && providers !== undefined;
  const showLogos = isLoaded && providers.length > 0;
  const showEmptyMessage = isLoaded && providers.length === 0;

  return (
    <div className={BROWSE_STREAM_ROW_SLOT_CLASS}>
      {showLogos ? (
        <StreamOnLabel
          providers={providers}
          density="compact"
          className="!mt-0"
        />
      ) : showEmptyMessage ? (
        <BrowseStreamEmptyMessage hasRentOrBuy={hasRentOrBuy} />
      ) : loadState === "error" && onRetry ? (
        isLoading ? (
          <BrowseStreamLoadingPlaceholder />
        ) : (
          <BrowseStreamRetryRow onRetry={onRetry} />
        )
      ) : loadState === "pending" && isLoading ? (
        <BrowseStreamLoadingPlaceholder />
      ) : null}
    </div>
  );
}
