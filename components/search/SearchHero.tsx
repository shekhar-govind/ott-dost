"use client";

import { BrowseList } from "@/components/browse/BrowseList";
import { TitleSummaryPanel } from "@/components/title/TitleSummaryPanel";
import type { SearchTitle } from "@/lib/tmdb/types";
import { useCallback, useState } from "react";
import { SearchBox } from "./SearchBox";

export function SearchHero() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<SearchTitle | null>(null);

  const showBrowse = !selected && query.trim() === "";

  const handleSelect = useCallback((item: SearchTitle) => {
    setSelected(item);
  }, []);

  const handleClear = useCallback(() => {
    setSelected(null);
    setQuery("");
  }, []);

  return (
    <section
      className={`mx-auto flex w-full max-w-xl flex-1 flex-col px-4 py-10 sm:max-w-2xl sm:px-6 sm:py-16 lg:max-w-3xl lg:px-8 lg:py-20 ${
        showBrowse ? "justify-start" : "justify-center"
      }`}
    >
      <div className="mb-6 text-center sm:mb-8">
        <h2 className="text-pretty text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl lg:text-3xl">
          What do you want to watch?
        </h2>
        <p className="mt-2 text-pretty text-sm text-zinc-500 sm:text-base">
          Search movies, web series, and documentaries
        </p>
      </div>

      <SearchBox
        query={query}
        onQueryChange={setQuery}
        onSelect={handleSelect}
        onClear={handleClear}
      />

      {showBrowse ? (
        <BrowseList enabled onSelect={handleSelect} />
      ) : (
        <TitleSummaryPanel selected={selected} />
      )}
    </section>
  );
}
