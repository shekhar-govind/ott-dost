"use client";

import { useEffect, useState } from "react";

/**
 * True when the app is running as an installed PWA (no browser tabs).
 *
 * In standalone mode `target="_blank"` links spawn a throwaway browsing
 * context whose back gesture exits the app, so callers use this to fall back
 * to same-window navigation. Returns `false` on the server and first render to
 * avoid hydration mismatches, then resolves after mount.
 */
export function useIsStandalone(): boolean {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(display-mode: standalone)");
    const update = () => {
      // iOS Safari uses the non-standard `navigator.standalone` instead of
      // the display-mode media query.
      const iosStandalone =
        (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true;
      setIsStandalone(media.matches || iosStandalone);
    };

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return isStandalone;
}
