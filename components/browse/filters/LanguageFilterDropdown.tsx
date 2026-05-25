"use client";

import {
  BROWSE_LANGUAGE_ALL,
  findBrowseLanguageOption,
  getLanguageChipLabel,
  isBrowseLanguageAll,
} from "@/lib/browse/languages";
import { filterBrowseLanguageSections } from "@/lib/browse/language-filter-search";
import type { BrowseLanguageOption } from "@/lib/browse/types";
import { useEffect, useId, useMemo, useRef, useState } from "react";

interface LanguageFilterDropdownProps {
  value: string;
  indianLanguages: BrowseLanguageOption[];
  otherLanguages: BrowseLanguageOption[];
  allLanguages: BrowseLanguageOption[];
  onChange: (code: string) => void;
  disabled?: boolean;
}

function selectedLanguageLabel(
  value: string,
  allLanguages: BrowseLanguageOption[],
): string {
  if (isBrowseLanguageAll(value)) return "All languages";
  const match = findBrowseLanguageOption(allLanguages, value);
  return match ? getLanguageChipLabel(match) : value.toUpperCase();
}

export function LanguageFilterDropdown({
  value,
  indianLanguages,
  otherLanguages,
  allLanguages,
  onChange,
  disabled = false,
}: LanguageFilterDropdownProps) {
  const listboxId = useId();
  const searchId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = useMemo(
    () => filterBrowseLanguageSections(indianLanguages, otherLanguages, query),
    [indianLanguages, otherLanguages, query],
  );

  const flatOptions = useMemo(() => {
    const items: { code: string; label: string; section?: string }[] = [];
    const showSectionHeaders = !query.trim();

    if (filtered.showAll) {
      items.push({ code: BROWSE_LANGUAGE_ALL, label: "All languages" });
    }

    let indianHeaderShown = false;
    for (const language of filtered.indian) {
      items.push({
        code: language.code,
        label: getLanguageChipLabel(language),
        section:
          showSectionHeaders && !indianHeaderShown ? "Indian languages" : undefined,
      });
      indianHeaderShown = true;
    }

    let otherHeaderShown = false;
    for (const language of filtered.other) {
      items.push({
        code: language.code,
        label: getLanguageChipLabel(language),
        section:
          showSectionHeaders && !otherHeaderShown ? "More languages" : undefined,
      });
      otherHeaderShown = true;
    }

    return items;
  }, [filtered, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      searchRef.current?.focus();
    } else {
      setQuery("");
    }
  }, [open]);

  const selectOption = (code: string) => {
    onChange(code);
    setOpen(false);
    setQuery("");
  };

  const onSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, Math.max(flatOptions.length - 1, 0)));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
      return;
    }
    if (event.key === "Enter" && flatOptions[activeIndex]) {
      event.preventDefault();
      selectOption(flatOptions[activeIndex].code);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      setQuery("");
    }
  };

  const isLoading = allLanguages.length === 0;
  const emptyResults = open && flatOptions.length === 0;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled || isLoading}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-left text-sm text-zinc-900 transition hover:border-zinc-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="truncate">
          {isLoading ? "Loading languages…" : selectedLanguageLabel(value, allLanguages)}
        </span>
        <span className="shrink-0 text-zinc-400" aria-hidden>
          {open ? "▴" : "▾"}
        </span>
      </button>

      {open ? (
        <div className="mt-2 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm ring-1 ring-zinc-900/5">
          <div className="border-b border-zinc-100 p-2">
            <label htmlFor={searchId} className="sr-only">
              Search languages
            </label>
            <input
              ref={searchRef}
              id={searchId}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onSearchKeyDown}
              placeholder="Search languages…"
              autoComplete="off"
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-300 focus:bg-white"
            />
          </div>

          {emptyResults ? (
            <p className="px-3 py-4 text-sm text-zinc-500">No languages match your search</p>
          ) : (
            <ul
              id={listboxId}
              role="listbox"
              aria-label="Language"
              className="max-h-52 overflow-y-auto overscroll-contain py-1 [-ms-overflow-style:none] [scrollbar-width:thin]"
            >
              {flatOptions.map((option, index) => (
                <li key={option.code} role="presentation">
                  {option.section ? (
                    <p className="px-3 pb-1 pt-2 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                      {option.section}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    role="option"
                    aria-selected={value === option.code}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => selectOption(option.code)}
                    className={`flex w-full px-3 py-2 text-left text-sm transition ${
                      value === option.code
                        ? "bg-zinc-900 text-white"
                        : index === activeIndex
                          ? "bg-zinc-100 text-zinc-900"
                          : "text-zinc-700 hover:bg-zinc-50"
                    }`}
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
