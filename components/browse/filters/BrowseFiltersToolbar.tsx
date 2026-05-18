"use client";

import { buildBrowseFilterChips } from "@/lib/browse/labels";
import {
  countActiveBrowseFilters,
  type BrowseFilters,
  type BrowseMediaType,
} from "@/lib/browse/filters";
import type { BrowseFilterMeta } from "@/lib/browse/types";
import { genreOptionsForMediaType, removeBrowseFilterChip } from "./browse-filter-utils";
import { FilterChip } from "./FilterChip";

interface BrowseFiltersToolbarProps {
  filters: BrowseFilters;
  meta: BrowseFilterMeta;
  onOpenFilters: () => void;
  onFiltersChange: (filters: BrowseFilters) => void;
  onClearFilters: () => void;
}

const MEDIA_SEGMENTS: { value: BrowseMediaType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "movie", label: "Movies" },
  { value: "tv", label: "TV" },
];

export function BrowseFiltersToolbar({
  filters,
  meta,
  onOpenFilters,
  onFiltersChange,
  onClearFilters,
}: BrowseFiltersToolbarProps) {
  const activeCount = countActiveBrowseFilters(filters);
  const genreOptions = genreOptionsForMediaType(meta, filters.mediaType);
  const chips = buildBrowseFilterChips(filters, genreOptions);

  return (
    <div className="mb-4 space-y-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onOpenFilters}
          className="inline-flex items-center rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-zinc-700"
        >
          Filters
          {activeCount > 0 ? (
            <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-white/20 px-1 text-[10px]">
              {activeCount}
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
              onClick={() => onFiltersChange({ ...filters, mediaType: segment.value })}
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
