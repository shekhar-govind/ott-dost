"use client";

import { BrowseList } from "@/components/browse/BrowseList";
import { SiteSearchPanel } from "@/components/search/SiteSearchPanel";
import {
  getRouteUrl,
  initRouteScrollStorage,
  normalizeRouteUrl,
  readSavedRouteScroll,
  restoreRouteScrollPixel,
  restoreRouteScrollWhenLayoutReady,
  saveRouteScrollPosition,
} from "@/lib/route-scroll";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const TITLE_DETAIL_PATH = /^\/(?:movie|tv)\/\d+\/[^/]+$/;

function usesSearchShell(pathname: string): boolean {
  return pathname === "/" || TITLE_DETAIL_PATH.test(pathname);
}

export function AppMainShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const showSearchShell = usesSearchShell(pathname);
  const isDesignPreview = pathname.startsWith("/design/");
  const [query, setQuery] = useState("");
  /** Routes the user has left at least once (skip restore on first visit). */
  const routesLeftRef = useRef(new Set<string>());
  const prevRouteUrlRef = useRef<string | null>(null);
  const scrollRestorationSetRef = useRef(false);
  const cancelScheduledRestoreRef = useRef<(() => void) | null>(null);

  const handleClear = () => {
    setQuery("");
  };

  useLayoutEffect(() => {
    if (scrollRestorationSetRef.current) return;
    if (typeof window === "undefined" || !("scrollRestoration" in window.history)) {
      return;
    }
    scrollRestorationSetRef.current = true;
    window.history.scrollRestoration = "manual";
    initRouteScrollStorage();
  }, []);

  const tryRestoreRoute = useCallback((route: string) => {
    const y = readSavedRouteScroll(route);
    if (y == null) return;

    cancelScheduledRestoreRef.current?.();

    const cancelRaf = restoreRouteScrollWhenLayoutReady(y);
    const t = window.setTimeout(() => {
      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      restoreRouteScrollPixel(Math.min(y, maxScroll));
    }, 100);

    cancelScheduledRestoreRef.current = () => {
      cancelRaf();
      clearTimeout(t);
    };
  }, []);

  /** Save scroll for the current URL before navigating away via a link. */
  useEffect(() => {
    const preNavigateSave = (event: Event) => {
      const target = (event as MouseEvent | PointerEvent).target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      let destRoute: string;
      try {
        const url = new URL(href, window.location.origin);
        destRoute = normalizeRouteUrl(url.pathname + url.search);
      } catch {
        return;
      }

      const currentRoute = getRouteUrl();
      if (destRoute === currentRoute) return;
      saveRouteScrollPosition(currentRoute);
    };

    document.addEventListener("pointerdown", preNavigateSave, true);
    return () => document.removeEventListener("pointerdown", preNavigateSave, true);
  }, [pathname]);

  /** Debounced save while on a route (one key per URL). */
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const onScroll = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        saveRouteScrollPosition(getRouteUrl());
      }, 120);
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (timeout) clearTimeout(timeout);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  /** Restore when returning to a URL we've left before. */
  useEffect(() => {
    const route = getRouteUrl();
    const prev = prevRouteUrlRef.current;
    prevRouteUrlRef.current = route;

    if (prev != null && prev !== route) {
      routesLeftRef.current.add(prev);
    }

    if (!routesLeftRef.current.has(route)) {
      return;
    }

    tryRestoreRoute(route);

    return () => {
      cancelScheduledRestoreRef.current?.();
    };
  }, [pathname, tryRestoreRoute]);

  /** Back/forward may update the URL before pathname — restore from that URL's key. */
  useEffect(() => {
    const run = () => {
      const route = getRouteUrl();
      if (!routesLeftRef.current.has(route)) return;
      tryRestoreRoute(route);
    };

    const onPopState = () => queueMicrotask(run);
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) queueMicrotask(run);
    };

    window.addEventListener("popstate", onPopState);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [tryRestoreRoute]);

  if (isDesignPreview) {
    return <main className="flex w-full flex-1 flex-col">{children}</main>;
  }

  const mainClassName =
    "mx-auto flex w-full max-w-xl flex-1 flex-col px-4 sm:max-w-2xl sm:px-6 lg:max-w-3xl lg:px-8 " +
    (showSearchShell ? "py-10 sm:py-16 lg:py-20" : "py-8 sm:py-12");

  if (!showSearchShell) {
    return <main className={mainClassName}>{children}</main>;
  }

  return (
    <main className={mainClassName}>
      <SiteSearchPanel
        query={query}
        onQueryChange={setQuery}
        onClear={handleClear}
      >
        {!isHome ? children : null}
        <Suspense fallback={<BrowseListFallback />}>
          <BrowseList enabled={isHome} preserveStateWhenDisabled />
        </Suspense>
      </SiteSearchPanel>
    </main>
  );
}

function BrowseListFallback() {
  return (
    <section className="mt-8 w-full" aria-hidden>
      <div className="mb-4 h-8 animate-pulse rounded-lg bg-zinc-100" />
      <ul className="space-y-1.5">
        {Array.from({ length: 5 }).map((_, index) => (
          <li
            key={index}
            className="min-h-[4.75rem] animate-pulse rounded-lg border border-zinc-100 bg-zinc-100"
          />
        ))}
      </ul>
    </section>
  );
}
