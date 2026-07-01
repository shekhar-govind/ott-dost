import { ListItemPoster } from "@/components/shared/ListItemPoster";
import { MediaListItemBody } from "@/components/shared/MediaListItemBody";
import { BROWSE_ITEM_LINK_CLASS } from "@/lib/browse/browse-item-link-class";
import type { BrowseFilters } from "@/lib/browse/filters";
import { browseItemKey } from "@/lib/browse/items";
import { titlePathFromSearchTitle } from "@/lib/title-url";
import type { BrowsePage } from "@/lib/tmdb/types";

interface HomeBrowseServerListProps {
  initialPage: BrowsePage;
  filters: BrowseFilters;
  listTitle?: string;
}

/** ISR HTML for home browse page 1 — replaced by the client list before paint. */
export function HomeBrowseServerList({
  initialPage,
  filters,
  listTitle,
}: HomeBrowseServerListProps) {
  const browseListTitle =
    listTitle ??
    (filters.mediaType === "tv" ? "Browse TV shows" : "Browse movies");

  return (
    <section
      data-home-browse-ssr
      className="mt-8 w-full"
      aria-label={browseListTitle}
    >
      <div className="mb-3 min-h-[2.75rem] sm:min-h-[3rem]" aria-hidden />

      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold tracking-tight text-zinc-900">
          {browseListTitle}
        </h3>
      </div>

      <div data-server-browse-items>
        <ul className="space-y-1.5">
          {initialPage.items.map((item) => (
            <li key={browseItemKey(item)} className="scroll-mt-4">
              <a
                href={titlePathFromSearchTitle(item)}
                target="_blank"
                rel="noopener noreferrer"
                className={BROWSE_ITEM_LINK_CLASS}
              >
                <span className="relative z-[1] flex w-full min-w-0 items-start gap-2.5 sm:gap-3">
                  <span className="relative z-[1] shrink-0 pt-px sm:pt-0.5">
                    <ListItemPoster
                      posterUrl={item.posterUrl}
                      title={item.title}
                    />
                  </span>
                  <MediaListItemBody item={item} variant="browse" />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
