"use client";

import { BrowseList } from "@/components/browse/BrowseList";
import { SiteSearchPanel } from "@/components/search/SiteSearchPanel";
import {
  readSavedHomeScroll,
  restoreHomeScrollPixel,
  restoreHomeScrollWhenLayoutReady,
  saveHomeScrollPosition,
} from "@/lib/home-scroll";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

export function AppMainShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [query, setQuery] = useState("");
  const hasLeftHomeRef = useRef(false);
  const prevPathnameRef = useRef<string | null>(null);
  const scrollRestorationSetRef = useRef(false);
  const cancelScheduledRestoreRef = useRef<(() => void) | null>(null);

  const handleClear = () => {
    setQuery("");
  };

  /** Take scroll restoration away from the browser (fixes back-to-top on browser Back). */
  useLayoutEffect(() => {
    if (scrollRestorationSetRef.current) return;
    if (typeof window === "undefined" || !("scrollRestoration" in window.history)) {
      return;
    }
    scrollRestorationSetRef.current = true;
    window.history.scrollRestoration = "manual";
  }, []);

  const scheduleRestore = useCallback((y: number) => {
    cancelScheduledRestoreRef.current?.();

    const cancelRaf = restoreHomeScrollWhenLayoutReady(y);
    const t = window.setTimeout(() => {
      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      restoreHomeScrollPixel(Math.min(y, maxScroll));
    }, 100);

    const cancel = () => {
      cancelRaf();
      clearTimeout(t);
    };
    cancelScheduledRestoreRef.current = cancel;
    return cancel;
  }, []);

  /** Save before internal navigation while still on `/` (Next scrolls to top after this). */
  useEffect(() => {
    if (!isHome) return;

    const preNavigateSave = (event: Event) => {
      const target = (event as MouseEvent | PointerEvent).target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      let path: string;
      try {
        path = new URL(href, window.location.origin).pathname;
      } catch {
        return;
      }
      if (path === "/") return;
      saveHomeScrollPosition();
    };

    document.addEventListener("pointerdown", preNavigateSave, true);
    return () => document.removeEventListener("pointerdown", preNavigateSave, true);
  }, [isHome]);

  useEffect(() => {
    if (!isHome) return;

    let timeout: ReturnType<typeof setTimeout> | undefined;
    const save = () => {
      saveHomeScrollPosition();
    };

    const onScroll = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(save, 120);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    save();

    return () => {
      if (timeout) clearTimeout(timeout);
      window.removeEventListener("scroll", onScroll);
      saveHomeScrollPosition();
    };
  }, [isHome]);

  /** Track leaving `/` and restore after the home document regains full height. */
  useEffect(() => {
    const prev = prevPathnameRef.current;
    prevPathnameRef.current = pathname;

    if (pathname !== "/") {
      if (prev === "/") {
        hasLeftHomeRef.current = true;
      }
      return;
    }

    if (!hasLeftHomeRef.current) {
      return;
    }

    const y = readSavedHomeScroll();
    if (y == null) return;

    return scheduleRestore(y);
  }, [pathname, scheduleRestore]);

  /** Back/Forward (incl. bfcache) can land before pathname updates — re-run restore. */
  useEffect(() => {
    const run = () => {
      if (window.location.pathname !== "/") return;
      if (!hasLeftHomeRef.current) return;
      const y = readSavedHomeScroll();
      if (y == null) return;
      scheduleRestore(y);
    };

    const onPopState = () => {
      queueMicrotask(run);
    };

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        queueMicrotask(run);
      }
    };

    window.addEventListener("popstate", onPopState);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [scheduleRestore]);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 py-10 sm:max-w-2xl sm:px-6 sm:py-16 lg:max-w-3xl lg:px-8 lg:py-20">
      <SiteSearchPanel
        query={query}
        onQueryChange={setQuery}
        onClear={handleClear}
      >
        {!isHome ? children : null}
        <BrowseList enabled={isHome} preserveStateWhenDisabled />
      </SiteSearchPanel>
    </main>
  );
}
