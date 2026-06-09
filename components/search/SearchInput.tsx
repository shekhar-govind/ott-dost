interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  placeholder?: string;
  isLoading?: boolean;
  listboxId?: string;
  isExpanded?: boolean;
}

export function SearchInput({
  value,
  onChange,
  onFocus,
  onKeyDown,
  inputRef,
  placeholder = "Search movies and TV shows…",
  isLoading = false,
  listboxId,
  isExpanded = false,
}: SearchInputProps) {
  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="search"
        enterKeyHint="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={isExpanded}
        aria-controls={isExpanded && listboxId ? listboxId : undefined}
        aria-label="Search titles"
        data-site-search-input
        className="w-full touch-manipulation rounded-xl border border-zinc-200 bg-white px-4 py-3.5 pr-11 text-base text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 sm:py-3 sm:text-sm"
      />
      {isLoading && (
        <span
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-600 sm:right-4"
          aria-hidden
        />
      )}
    </div>
  );
}
