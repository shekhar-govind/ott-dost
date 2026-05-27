"use client";

import type { ReactNode } from "react";
import { SearchBox } from "./SearchBox";

interface SiteSearchPanelProps {
  query: string;
  onQueryChange: (query: string) => void;
  onClear?: () => void;
  children?: ReactNode;
}

export function SiteSearchPanel({
  query,
  onQueryChange,
  onClear,
  children,
}: SiteSearchPanelProps) {
  return (
    <section className="flex w-full flex-col justify-start">
      <div className="mb-6 text-center sm:mb-8">
        <h2 className="text-pretty text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl lg:text-3xl">
          What do you want to watch?
        </h2>
        <p className="mt-2 text-pretty text-sm text-zinc-500 sm:text-base">
          Search movies and TV shows
        </p>
      </div>

      <SearchBox query={query} onQueryChange={onQueryChange} onClear={onClear} />

      {children}
    </section>
  );
}
