import type { SearchTitle } from "@/lib/tmdb/types";
import { SearchResultItem } from "./SearchResultItem";

interface SearchAutocompleteProps {
  results: SearchTitle[];
  isOpen: boolean;
  isLoading: boolean;
  query: string;
  error: string | null;
  activeIndex: number;
  onSelect: (item: SearchTitle) => void;
  onActiveIndexChange: (index: number) => void;
  listboxId: string;
}

export function SearchAutocomplete({
  results,
  isOpen,
  isLoading,
  query,
  error,
  activeIndex,
  onSelect,
  onActiveIndexChange,
  listboxId,
}: SearchAutocompleteProps) {
  if (!isOpen) return null;

  const showEmpty =
    !isLoading && !error && query.trim().length >= 2 && results.length === 0;

  return (
    <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-10 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg">
      {error && (
        <p className="px-4 py-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {showEmpty && (
        <p className="px-4 py-3 text-sm text-zinc-500">No results found</p>
      )}

      {results.length > 0 && (
        <ul id={listboxId} role="listbox" className="max-h-80 overflow-y-auto py-1">
          {results.map((item, index) => (
            <SearchResultItem
              key={`${item.mediaType}-${item.id}`}
              item={item}
              isActive={index === activeIndex}
              onSelect={onSelect}
              onHover={() => onActiveIndexChange(index)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
