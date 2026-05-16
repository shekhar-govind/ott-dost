import { getMediaTypeLabel } from "@/lib/tmdb/utils";
import type { SearchTitle } from "@/lib/tmdb/types";

interface SearchResultItemProps {
  item: SearchTitle;
  isActive: boolean;
  onSelect: (item: SearchTitle) => void;
  onHover: () => void;
}

export function SearchResultItem({
  item,
  isActive,
  onSelect,
  onHover,
}: SearchResultItemProps) {
  return (
    <li>
      <button
        type="button"
        onMouseEnter={onHover}
        onClick={() => onSelect(item)}
        className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition ${
          isActive ? "bg-zinc-100" : "hover:bg-zinc-50"
        }`}
      >
        <Poster posterUrl={item.posterUrl} title={item.title} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-zinc-900">
              {item.title}
            </p>
            {item.year && (
              <span className="shrink-0 text-xs text-zinc-400">{item.year}</span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-zinc-500">
            {getMediaTypeLabel(item.mediaType)}
          </p>
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
