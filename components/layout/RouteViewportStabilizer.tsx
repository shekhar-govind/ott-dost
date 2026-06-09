"use client";

import { stabilizeMobileViewport, shouldStabilizeViewport } from "@/lib/mobile-viewport-stabilize";
import { usePathname, useSearchParams } from "next/navigation";
import { useLayoutEffect, useRef } from "react";

/** Runs after client navigations on mobile to expand browser chrome before first scroll. */
export function RouteViewportStabilizer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const anchorRef = useRef<HTMLInputElement>(null);
  const isFirstRender = useRef(true);
  const searchKey = searchParams.toString();

  useLayoutEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!shouldStabilizeViewport()) return;
    void stabilizeMobileViewport(anchorRef.current);
  }, [pathname, searchKey]);

  return (
    <input
      ref={anchorRef}
      type="text"
      tabIndex={-1}
      aria-hidden
      defaultValue=""
      readOnly
      className="pointer-events-none fixed left-0 top-0 h-px w-px opacity-0"
      data-viewport-anchor
    />
  );
}
