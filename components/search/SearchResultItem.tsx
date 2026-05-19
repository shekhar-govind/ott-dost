import type { SearchTitle } from "@/lib/tmdb/types";
import { MediaTitleListLink } from "@/components/shared/MediaTitleListLink";

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
      <MediaTitleListLink
        variant="search"
        item={item}
        isActive={isActive}
        onMouseEnter={onHover}
        onTouchStart={onHover}
        onClick={onSelect}
      />
    </li>
  );
}
