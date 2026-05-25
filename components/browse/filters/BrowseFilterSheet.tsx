"use client";

import {
  applyBrowseDatePreset,
  BROWSE_CUSTOM_YEAR_MAX,
  BROWSE_CUSTOM_YEAR_MIN,
  customBrowseDateRangeFromYears,
  datePresetIdForFilters,
  getBrowseCustomYearOptions,
  getBrowseDatePresets,
  isCustomBrowseDateRangeInvalid,
} from "@/lib/browse/date-presets";
import { getLanguageChipLabel } from "@/lib/browse/languages";
import { browseDebug } from "@/lib/browse/debug";
import { filtersAreEqual, type BrowseFilters } from "@/lib/browse/filters";
import type { BrowseFilterMeta } from "@/lib/browse/types";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useEffect, useId, useRef, useState } from "react";
import {
  genreOptionsForMediaType,
  providerOptionsForMediaType,
  sanitizeBrowseFiltersForMediaType,
  toggleGenre,
  selectLanguage,
  toggleProvider,
} from "./browse-filter-utils";
import { FilterChip } from "./FilterChip";
import { OttProviderFilterTile } from "./OttProviderFilterTile";

interface BrowseFilterSheetProps {
  open: boolean;
  appliedFilters: BrowseFilters;
  meta: BrowseFilterMeta;
  onClose: () => void;
  onApply: (filters: BrowseFilters) => void;
}

export function BrowseFilterSheet({
  open,
  appliedFilters,
  meta,
  onClose,
  onApply,
}: BrowseFilterSheetProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState(appliedFilters);

  useEffect(() => {
    if (open) setDraft(appliedFilters);
  }, [open, appliedFilters]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const languages = meta.languages;
  const providers = providerOptionsForMediaType(meta, draft.mediaType);
  const genreOptions = genreOptionsForMediaType(meta, draft.mediaType);
  const datePresets = getBrowseDatePresets();
  const datePresetId = datePresetIdForFilters(draft);
  const customYearOptions = getBrowseCustomYearOptions();
  const clampCustomYear = (year: string | undefined, fallback: number) => {
    const parsed = Number(year);
    if (!Number.isInteger(parsed)) return String(fallback);
    return String(
      Math.min(BROWSE_CUSTOM_YEAR_MAX, Math.max(BROWSE_CUSTOM_YEAR_MIN, parsed)),
    );
  };
  const customFromYear = clampCustomYear(
    draft.dateFrom?.slice(0, 4),
    customYearOptions.at(-1) ?? BROWSE_CUSTOM_YEAR_MIN,
  );
  const customToYear = clampCustomYear(
    draft.dateTo?.slice(0, 4),
    customYearOptions[0] ?? BROWSE_CUSTOM_YEAR_MAX,
  );
  const customDateRangeInvalid =
    datePresetId === "custom" &&
    isCustomBrowseDateRangeInvalid(customFromYear, customToYear);
  const applyDisabled =
    filtersAreEqual(draft, appliedFilters) || customDateRangeInvalid;

  const handleApply = () => {
    if (customDateRangeInvalid) return;

    browseDebug("Filter sheet apply", {
      draftProviderIds: draft.providerIds,
      ottChipOptions: providers.map((provider) => ({
        id: provider.id,
        name: provider.name,
      })),
      appliedProviderIds: appliedFilters.providerIds,
    });
    onApply(sanitizeBrowseFiltersForMediaType(draft, meta));
    onClose();
  };

  const panel = (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className={
        isDesktop
          ? "relative z-10 flex max-h-[min(85dvh,720px)] w-full max-w-md min-h-0 flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl ring-1 ring-zinc-900/5"
          : "relative z-10 flex max-h-[min(85dvh,640px)] w-full min-h-0 flex-col rounded-t-2xl border border-zinc-200 border-b-0 bg-white px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.2)] ring-1 ring-zinc-900/5"
      }
    >
      {!isDesktop ? (
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-zinc-300" aria-hidden />
      ) : null}

      <div
        className={
          isDesktop
            ? "mb-4 flex shrink-0 items-center justify-between gap-3"
            : "-mx-4 mb-4 flex shrink-0 items-center justify-between gap-3 border-b border-zinc-200 bg-zinc-50 px-4 py-3"
        }
      >
        <h4 id={titleId} className="text-sm font-semibold text-zinc-900 sm:text-base">
          Filters
        </h4>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium text-zinc-500 transition hover:text-zinc-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={applyDisabled}
            className="text-sm font-semibold text-zinc-900 transition hover:text-zinc-600 disabled:opacity-40"
          >
            Apply
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain pr-1 [-ms-overflow-style:none] [scrollbar-width:thin]">
        <section>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
            Language
          </p>
          <div className="flex flex-wrap gap-1.5">
            {languages.length === 0 ? (
              <p className="text-xs text-zinc-400">Loading languages…</p>
            ) : null}
            {languages.map((language) => (
              <FilterChip
                key={language.code}
                label={getLanguageChipLabel(language)}
                active={draft.language === language.code}
                onClick={() => setDraft((prev) => selectLanguage(prev, language.code))}
              />
            ))}
          </div>
        </section>

        <section>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
            Genres
          </p>
          <div className="flex flex-wrap gap-1.5">
            {genreOptions.length === 0 ? (
              <p className="text-xs text-zinc-400">Loading genres…</p>
            ) : null}
            {genreOptions.map((genre) => (
              <FilterChip
                key={genre.id}
                label={genre.name}
                active={draft.genreIds.includes(genre.id)}
                onClick={() => setDraft((prev) => toggleGenre(prev, genre.id))}
              />
            ))}
          </div>
        </section>

        <section>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
            Released
          </p>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {datePresets.map((preset) => (
              <FilterChip
                key={preset.id}
                label={preset.label}
                active={datePresetId === preset.id}
                onClick={() =>
                  setDraft((prev) => ({
                    ...prev,
                    ...applyBrowseDatePreset(preset.id),
                  }))
                }
              />
            ))}
            <FilterChip
              label="Custom"
              active={datePresetId === "custom"}
              onClick={() =>
                setDraft((prev) => ({
                  ...prev,
                  ...customBrowseDateRangeFromYears(customFromYear, customToYear),
                }))
              }
            />
          </div>
          {datePresetId === "custom" ? (
            <div>
              <div className="flex items-center gap-2">
                <label className="flex flex-1 flex-col gap-1 text-xs text-zinc-500">
                  From
                  <select
                    value={customFromYear}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        dateFrom: `${event.target.value}-01-01`,
                      }))
                    }
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900"
                  >
                    {customYearOptions.map((year) => (
                      <option key={`from-${year}`} value={String(year)}>
                        {year}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-1 flex-col gap-1 text-xs text-zinc-500">
                  To
                  <select
                    value={customToYear}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        dateTo: `${event.target.value}-12-31`,
                      }))
                    }
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900"
                  >
                    {customYearOptions.map((year) => (
                      <option key={`to-${year}`} value={String(year)}>
                        {year}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {customDateRangeInvalid ? (
                <p className="mt-2 text-xs text-red-600" role="alert">
                  “From” year must be earlier than or equal to “To” year.
                </p>
              ) : null}
            </div>
          ) : null}
        </section>

        <section>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
            Streaming on
          </p>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-4">
            {providers.length === 0 ? (
              <p className="col-span-full text-xs text-zinc-400">Loading platforms…</p>
            ) : null}
            {providers.map((provider) => (
              <OttProviderFilterTile
                key={provider.id}
                provider={provider}
                active={draft.providerIds.includes(provider.id)}
                onToggle={() => setDraft((prev) => toggleProvider(prev, provider.id))}
              />
            ))}
          </div>
        </section>
      </div>

      <button
        type="button"
        onClick={handleApply}
        disabled={applyDisabled}
        className="mt-5 w-full shrink-0 rounded-xl bg-zinc-900 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 lg:hidden"
      >
        Apply filters
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-start lg:pt-16">
      <button
        type="button"
        aria-label="Close filters"
        className="absolute inset-0 bg-zinc-900/50 backdrop-blur-[2px]"
        onClick={onClose}
      />
      {panel}
    </div>
  );
}
