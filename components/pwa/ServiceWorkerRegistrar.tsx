"use client";

import { useEffect } from "react";

/**
 * Registers the service worker so Chromium browsers offer the PWA install
 * prompt. Registration is production-only to avoid interfering with the dev
 * server. This is the single place to add update-prompt UX later.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registration failures are non-fatal; the app works without the SW.
    });
  }, []);

  return null;
}
