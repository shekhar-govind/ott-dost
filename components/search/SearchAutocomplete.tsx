import type { SearchTitle } from "@/lib/tmdb/types";
import { SearchResultItem } from "./SearchResultItem";

interface SearchAutocompleteProps {
  results: SearchTitle[];
  isOpen: boolean;
  isLoading: boolean;
  query: string;
  error: string | null;
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onSelect: (item: SearchTitle) => void;
  listboxId: string;
}

export function SearchAutocomplete({
  results,
  isOpen,
  isLoading,
  query,
  error,
  activeIndex,
  onActiveIndexChange,
  onSelect,
  listboxId,
}: SearchAutocompleteProps) {
  if (!isOpen) return null;

  const showEmpty =
    !isLoading && !error && query.trim().length >= 2 && results.length === 0;

  return (
    <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg sm:shadow-xl">
      {error && (
        <p className="px-4 py-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {showEmpty && (
        <p className="px-4 py-3 text-sm text-zinc-500">No results found</p>
      )}

      {results.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          className="max-h-[min(24rem,58svh)] overflow-y-auto overscroll-contain py-1 sm:max-h-[22rem]"
        >
          {results.map((item, index) => (
            <SearchResultItem
              key={`${item.mediaType}-${item.id}`}
              item={item}
              isActive={index === activeIndex}
              onHover={() => onActiveIndexChange(index)}
              onSelect={() => onSelect(item)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
