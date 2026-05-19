import { MediaTitleListLink } from "@/components/shared/MediaTitleListLink";
import { browseItemKey } from "@/lib/browse/items";
import type { SearchTitle } from "@/lib/tmdb/types";

interface TitleRecommendationsProps {
  items: SearchTitle[];
}

export function TitleRecommendations({ items }: TitleRecommendationsProps) {
  if (items.length === 0) return null;

  return (
    <article className="mt-3 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-100 px-4 py-3 sm:px-6">
        <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          More like this
        </h2>
      </div>
      <ul className="divide-y divide-zinc-100">
        {items.map((item) => (
          <li key={browseItemKey(item)}>
            <MediaTitleListLink variant="browse" item={item} />
          </li>
        ))}
      </ul>
    </article>
  );
}
