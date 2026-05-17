import type { SearchTitle } from "@/lib/tmdb/types";
import { formatReleaseDate, getMediaTypeLabel } from "@/lib/tmdb/utils";
import { GenreTags } from "./GenreTags";
import { StreamOnLabel } from "./StreamOnLabel";

interface BrowseListItemProps {
  item: SearchTitle;
  onSelect: (item: SearchTitle) => void;
}

export function BrowseListItem({ item, onSelect }: BrowseListItemProps) {
  const formattedDate = formatReleaseDate(item.releaseDate);

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(item)}
        className="flex w-full min-h-14 touch-manipulation items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-3 text-left shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 active:bg-zinc-100 sm:min-h-0 sm:py-2.5"
      >
        <Poster posterUrl={item.posterUrl} title={item.title} />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-baseline gap-x-2">
            <p className="truncate text-sm font-medium text-zinc-900">
              {item.title}
            </p>
            {item.year && (
              <span className="shrink-0 text-xs text-zinc-400">{item.year}</span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-zinc-500">
            {getMediaTypeLabel(item.mediaType)}
            {formattedDate ? ` · ${formattedDate}` : ""}
          </p>
          <GenreTags genres={item.genres} />
          <StreamOnLabel streamOn={item.streamOn} />
        </div>
      </button>
    </li>
  );
}

function Poster({
  posterUrl,
  title,
}: {
  posterUrl: string | null;
  title: string;
}) {
  if (posterUrl) {
    return (
      <img
        src={posterUrl}
        alt=""
        width={32}
        height={48}
        className="h-12 w-8 shrink-0 rounded object-cover bg-zinc-100"
      />
    );
  }

  return (
    <div
      className="flex h-12 w-8 shrink-0 items-center justify-center rounded bg-zinc-100 text-[10px] font-medium text-zinc-400"
      aria-hidden
    >
      {title.slice(0, 1).toUpperCase()}
    </div>
  );
}
