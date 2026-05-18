import type { SearchTitle } from "@/lib/tmdb/types";
import { ListItemPoster } from "@/components/shared/ListItemPoster";
import { MediaListItemBody } from "@/components/shared/MediaListItemBody";
import Link from "next/link";
import { titlePathFromSearchTitle } from "@/lib/title-url";

interface SearchResultItemProps {
  item: SearchTitle;
  isActive: boolean;
  onHover: () => void;
  onSelect: () => void;
}

export function SearchResultItem({
  item,
  isActive,
  onHover,
  onSelect,
}: SearchResultItemProps) {
  return (
    <li role="option" aria-selected={isActive}>
      <Link
        href={titlePathFromSearchTitle(item)}
        onMouseEnter={onHover}
        onTouchStart={onHover}
        onClick={onSelect}
        className={`flex w-full min-h-14 touch-manipulation items-start gap-3 px-3 py-3 text-left transition active:bg-zinc-100 sm:min-h-0 sm:py-2.5 ${
          isActive ? "bg-zinc-100" : "hover:bg-zinc-50"
        }`}
      >
        <span className="shrink-0 pt-0.5 sm:pt-0">
          <ListItemPoster posterUrl={item.posterUrl} title={item.title} />
        </span>
        <MediaListItemBody item={item} />
      </Link>
    </li>
  );
}
