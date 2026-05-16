"use client";

import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useTitleSearch } from "@/hooks/useTitleSearch";
import type { SearchTitle } from "@/lib/tmdb/types";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { SearchAutocomplete } from "./SearchAutocomplete";
import { SearchInput } from "./SearchInput";

const DEBOUNCE_MS = 300;

export function SearchBox() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const debouncedQuery = useDebouncedValue(query, DEBOUNCE_MS);
  const { results, isLoading, error } = useTitleSearch(debouncedQuery);

  const showDropdown =
    isOpen && (query.trim().length >= 2 || isLoading || Boolean(error));

  useEffect(() => {
    setActiveIndex(results.length > 0 ? 0 : -1);
  }, [results]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = useCallback((item: SearchTitle) => {
    setQuery(item.title);
    setIsOpen(false);
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showDropdown || results.length === 0) {
        if (event.key === "Escape") setIsOpen(false);
        return;
      }

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setActiveIndex((prev) =>
            prev < results.length - 1 ? prev + 1 : 0,
          );
          break;
        case "ArrowUp":
          event.preventDefault();
          setActiveIndex((prev) =>
            prev > 0 ? prev - 1 : results.length - 1,
          );
          break;
        case "Enter":
          if (activeIndex >= 0 && results[activeIndex]) {
            event.preventDefault();
            handleSelect(results[activeIndex]);
          }
          break;
        case "Escape":
          setIsOpen(false);
          break;
      }
    },
    [activeIndex, handleSelect, results, showDropdown],
  );

  return (
    <div ref={containerRef} className="relative w-full">
      <SearchInput
        inputRef={inputRef}
        value={query}
        onChange={(value) => {
          setQuery(value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        isLoading={isLoading}
      />

      <SearchAutocomplete
        results={results}
        isOpen={showDropdown}
        isLoading={isLoading}
        query={query}
        error={error}
        activeIndex={activeIndex}
        onSelect={handleSelect}
        onActiveIndexChange={setActiveIndex}
        listboxId={listboxId}
      />
    </div>
  );
}
