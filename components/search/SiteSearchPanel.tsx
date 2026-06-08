"use client";

import type { ReactNode } from "react";
import { SearchBox } from "./SearchBox";

interface SiteSearchPanelProps {
  query: string;
  onQueryChange: (query: string) => void;
  onClear?: () => void;
  variant?: "home" | "detail";
  children?: ReactNode;
}

export function SiteSearchPanel({
  query,
  onQueryChange,
  onClear,
  variant = "home",
  children,
}: SiteSearchPanelProps) {
  return (
    <section
      className={
        "flex w-full flex-col justify-start " +
        (variant === "detail" ? "gap-3" : "")
      }
    >
      {variant === "detail" ? (
        <div className="w-full">
          <p className="mb-2 text-sm text-zinc-500">
            Looking for something else?
          </p>
          <SearchBox
            query={query}
            onQueryChange={onQueryChange}
            onClear={onClear}
            placeholder="Search movies and TV shows…"
          />
        </div>
      ) : null}

      {variant === "home" ? (
        <>
          <div className="mb-6 text-center sm:mb-8">
            <h2 className="text-pretty text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl lg:text-3xl">
              What do you want to watch?
            </h2>
            <p className="mt-2 text-pretty text-sm text-zinc-500 sm:text-base">
              Search movies and TV shows
            </p>
          </div>

          <SearchBox query={query} onQueryChange={onQueryChange} onClear={onClear} />
        </>
      ) : null}

      {children}
    </section>
  );
}
