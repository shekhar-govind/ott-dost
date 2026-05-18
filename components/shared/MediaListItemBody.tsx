import type { SearchTitle } from "@/lib/tmdb/types";
import { buildListMetaLine } from "@/lib/tmdb/utils";
import { StreamOnLabel } from "./StreamOnLabel";

interface MediaListItemBodyProps {
  item: SearchTitle;
  /**
   * When true, show the stream row even if empty (e.g. “not on OTT”).
   * Browse omits this row; title detail uses {@link TitleSummaryProviders} instead.
   */
  showStreamWhenEmpty?: boolean;
}

export function MediaListItemBody({
  item,
  showStreamWhenEmpty = false,
}: MediaListItemBodyProps) {
  const metaLine = buildListMetaLine({
    mediaType: item.mediaType,
    rating: item.rating,
    releaseDate: item.releaseDate,
    languageLabel: item.languageLabel,
  });

  const overview = item.overview?.trim();

  const showStream =
    item.streamProviders.length > 0 || showStreamWhenEmpty;

  return (
    <div className="min-w-0 flex-1">
      <p className="min-w-0 truncate text-[15px] font-medium leading-snug text-zinc-900 sm:text-base">
        {item.title}
      </p>
      <p className="mt-px truncate text-[11px] leading-tight tabular-nums text-zinc-400">
        {metaLine}
      </p>
      {overview ? (
        <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-zinc-500">
          {overview}
        </p>
      ) : null}
      {item.genres.length > 0 ? (
        <p className="mt-1 truncate text-[11px] text-zinc-400">
          {item.genres.join(" · ")}
        </p>
      ) : null}
      {showStream ? (
        <StreamOnLabel providers={item.streamProviders} density="compact" />
      ) : null}
    </div>
  );
}
