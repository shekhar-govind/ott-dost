import type { SearchTitle } from "@/lib/tmdb/types";
import { ListItemPoster } from "@/components/shared/ListItemPoster";
import { MediaListItemBody } from "@/components/shared/MediaListItemBody";
import Link from "next/link";
import { titlePathFromSearchTitle } from "@/lib/title-url";

interface BrowseListItemProps {
  item: SearchTitle;
}

export function BrowseListItem({ item }: BrowseListItemProps) {
  return (
    <li>
      <Link
        href={titlePathFromSearchTitle(item)}
        className="flex w-full min-h-14 touch-manipulation items-start gap-2.5 rounded-lg border border-zinc-100 bg-white px-2.5 py-2 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:border-zinc-200/90 hover:bg-zinc-50/70 active:bg-zinc-50 sm:min-h-0 sm:gap-3 sm:px-3 sm:py-2.5"
      >
        <span className="shrink-0 pt-px sm:pt-0.5">
          <ListItemPoster posterUrl={item.posterUrl} title={item.title} />
        </span>
        <MediaListItemBody item={item} showStreamWhenEmpty />
      </Link>
    </li>
  );
}
