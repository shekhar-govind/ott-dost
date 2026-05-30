"use client";

import { consumeScrollTopOnHomeLand } from "@/lib/browse/scroll-top-on-home-land";
import {
  BACK_NAVIGATION_LOG_PREFIX,
  hasPendingBackNavigation,
  initBackNavigationDetection,
  notifyRouteSettled,
} from "@/lib/navigation/back-navigation";
import {
  getRouteUrl,
  restoreSavedRouteScroll,
  scrollRouteToTop,
} from "@/lib/route-scroll";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";

/**
 * On history back: log (dev) and restore scroll from sessionStorage.
 * Saving scroll positions is handled in AppMainShell.
 */
export function BackNavigationCoordinator() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const cancelRestoreRef = useRef<(() => void) | null>(null);

  useLayoutEffect(() => {
    initBackNavigationDetection((event) => {
      if (process.env.NODE_ENV !== "production") {
        console.log(`${BACK_NAVIGATION_LOG_PREFIX} landed via back`, event);
      }

      cancelRestoreRef.current?.();
      cancelRestoreRef.current = restoreSavedRouteScroll(event.route);
    });

    return () => {
      cancelRestoreRef.current?.();
      cancelRestoreRef.current = null;
    };
  }, []);

  useEffect(() => {
    const route = getRouteUrl();

    if (hasPendingBackNavigation()) {
      notifyRouteSettled(route);
      return;
    }

    if (pathname === "/" && consumeScrollTopOnHomeLand()) {
      cancelRestoreRef.current?.();
      cancelRestoreRef.current = null;
      scrollRouteToTop();
    }

    notifyRouteSettled(route);
  }, [pathname, searchParams]);

  return null;
}
