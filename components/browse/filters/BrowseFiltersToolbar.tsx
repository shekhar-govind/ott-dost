"use client";

import { useBrowsePersonFilterNames } from "@/hooks/useBrowsePersonFilterNames";
import { buildBrowseFilterChips } from "@/lib/browse/labels";
import {
  countBrowseRefinementFilters,
  type BrowseFilters,
  type BrowseMediaType,
} from "@/lib/browse/filters";
import type { BrowseFilterMeta } from "@/lib/browse/types";
import { useMemo } from "react";
import {
  applyBrowseMediaTypeChange,
  genreOptionsForMediaType,
  providerOptionsForMediaType,
  removeBrowseFilterChip,
} from "./browse-filter-utils";
import { FilterChip } from "./FilterChip";

interface BrowseFiltersToolbarProps {
  filters: BrowseFilters;
  meta: BrowseFilterMeta;
  filtersSheetOpen: boolean;
  onOpenFilters: () => void;
  onFiltersChange: (filters: BrowseFilters) => void;
  onClearFilters: () => void;
}

function ChevronDownIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

const MEDIA_SEGMENTS: { value: BrowseMediaType; label: string }[] = [
  { value: "movie", label: "Movies" },
  { value: "tv", label: "TV" },
];

export function BrowseFiltersToolbar({
  filters,
  meta,
  filtersSheetOpen,
  onOpenFilters,
  onFiltersChange,
  onClearFilters,
}: BrowseFiltersToolbarProps) {
  const refinementCount = countBrowseRefinementFilters(filters);
  const personLabels = useBrowsePersonFilterNames(filters);
  const genreOptions = genreOptionsForMediaType(meta, filters.mediaType);
  const providerOptions = providerOptionsForMediaType(meta, filters.mediaType);
  const chips = useMemo(
    () =>
      buildBrowseFilterChips(
        filters,
        genreOptions,
        meta.languages,
        providerOptions,
        personLabels,
      ),
    [filters, genreOptions, meta.languages, providerOptions, personLabels],
  );

  return (
    <div className="mb-4 space-y-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onOpenFilters}
          aria-expanded={filtersSheetOpen}
          aria-haspopup="dialog"
          aria-controls="browse-filter-sheet"
          className="inline-flex items-center gap-1 rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 shadow-sm transition hover:border-zinc-400 hover:bg-zinc-50"
        >
          <span>More filters</span>
          <ChevronDownIcon
            className={`h-3.5 w-3.5 shrink-0 text-zinc-500 transition ${filtersSheetOpen ? "rotate-180" : ""}`}
          />
          {refinementCount > 0 ? (
            <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] font-semibold text-white">
              {refinementCount}
            </span>
          ) : null}
        </button>

        <div
          className="flex rounded-full border border-zinc-200 bg-white p-0.5 text-[11px] sm:text-xs"
          role="group"
          aria-label="Content type"
        >
          {MEDIA_SEGMENTS.map((segment) => (
            <button
              key={segment.value}
              type="button"
              onClick={() =>
                onFiltersChange(
                  applyBrowseMediaTypeChange(filters, segment.value, meta),
                )
              }
              className={`rounded-full px-2.5 py-1 font-medium transition sm:px-3 ${
                filters.mediaType === segment.value
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              {segment.label}
            </button>
          ))}
        </div>
      </div>

      {chips.length > 0 ? (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {chips.map((chip) => (
            <FilterChip
              key={chip.key}
              label={chip.label}
              active
              onClick={() =>
                onFiltersChange(removeBrowseFilterChip(filters, chip.key))
              }
            />
          ))}
          <button
            type="button"
            onClick={onClearFilters}
            className="shrink-0 px-1 py-1 text-xs font-medium text-zinc-500 transition hover:text-zinc-800"
          >
            Clear
          </button>
        </div>
      ) : null}
    </div>
  );
}
