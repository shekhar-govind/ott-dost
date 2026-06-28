import type { SearchTitle } from "@/lib/tmdb/types";

/**
 * Session-scoped snapshot of the home browse list + scroll position so that
 * navigating into a title and pressing back returns the user to the same items
 * and scroll offset, instead of resetting the infinite-scroll list to page 1.
 *
 * Stored in two keys: a (larger) list snapshot written when items change, and a
 * (tiny) scroll snapshot written on scroll/navigation. Both are single,
 * overwriting keys so storage stays bounded regardless of how the user browses.
 */

const LIST_KEY = "ottdost:browse-list-snapshot";
const SCROLL_KEY = "ottdost:browse-scroll-snapshot";

/** Ignore snapshots older than this so a long-parked session refetches fresh. */
const TTL_MS = 30 * 60 * 1000;

export interface BrowseListSnapshot {
  filterKey: string;
  items: SearchTitle[];
  loadedPage: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
  emptyPageStreak: number;
  savedAt: number;
}

interface BrowseScrollSnapshot {
  filterKey: string;
  scrollY: number;
  savedAt: number;
}

function getSession(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.sessionStorage;
  } catch {
    // Some privacy modes throw on access.
    return null;
  }
}

function isFresh(savedAt: number): boolean {
  return Number.isFinite(savedAt) && Date.now() - savedAt <= TTL_MS;
}

export function saveBrowseListSnapshot(
  snapshot: Omit<BrowseListSnapshot, "savedAt">,
): void {
  const store = getSession();
  if (!store) return;
  try {
    const payload: BrowseListSnapshot = { ...snapshot, savedAt: Date.now() };
    store.setItem(LIST_KEY, JSON.stringify(payload));
  } catch {
    // Quota exceeded or serialization failure: drop the snapshot so we never
    // restore partial/corrupt state. Scroll restore simply won't happen.
    try {
      store.removeItem(LIST_KEY);
    } catch {
      // ignore
    }
  }
}

export function loadBrowseListSnapshot(
  filterKey: string,
): BrowseListSnapshot | null {
  const store = getSession();
  if (!store) return null;
  try {
    const raw = store.getItem(LIST_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BrowseListSnapshot;
    if (parsed.filterKey !== filterKey) return null;
    if (!Array.isArray(parsed.items) || parsed.items.length === 0) return null;
    if (!isFresh(parsed.savedAt)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearBrowseListSnapshot(): void {
  const store = getSession();
  if (!store) return;
  try {
    store.removeItem(LIST_KEY);
  } catch {
    // ignore
  }
}

export function saveBrowseScroll(filterKey: string, scrollY: number): void {
  const store = getSession();
  if (!store) return;
  try {
    const payload: BrowseScrollSnapshot = {
      filterKey,
      scrollY,
      savedAt: Date.now(),
    };
    store.setItem(SCROLL_KEY, JSON.stringify(payload));
  } catch {
    // ignore: scroll restore is best-effort
  }
}

export function loadBrowseScroll(filterKey: string): number | null {
  const store = getSession();
  if (!store) return null;
  try {
    const raw = store.getItem(SCROLL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BrowseScrollSnapshot;
    if (parsed.filterKey !== filterKey) return null;
    if (!isFresh(parsed.savedAt)) return null;
    return typeof parsed.scrollY === "number" ? parsed.scrollY : null;
  } catch {
    return null;
  }
}
