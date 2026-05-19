import type { SearchTitle } from "@/lib/tmdb/types";
import { MediaTitleListLink } from "@/components/shared/MediaTitleListLink";

interface BrowseListItemProps {
  item: SearchTitle;
}

export function BrowseListItem({ item }: BrowseListItemProps) {
  return (
    <li>
      <MediaTitleListLink variant="browse" item={item} />
    </li>
  );
}
