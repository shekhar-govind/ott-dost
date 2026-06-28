"use client";

import { useEffect } from "react";

/**
 * Recovers long-lived sessions across deployments.
 *
 * When a new version is deployed, the running page may try to load a hashed JS
 * chunk that no longer exists on the server, throwing a ChunkLoadError (usually
 * as an unhandled promise rejection from a dynamic import). Installed PWA
 * sessions stay open for a long time, so they hit this more than browser tabs.
 *
 * On detection we reload once to fetch fresh HTML that references valid chunks.
 * A short cooldown stored in sessionStorage prevents a reload loop if a reload
 * doesn't resolve the failure.
 */
const RELOAD_AT_KEY = "ottdost:chunk-reload-at";
const RELOAD_COOLDOWN_MS = 15_000;

function isChunkLoadError(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const err = value as { name?: unknown; message?: unknown };
  const name = typeof err.name === "string" ? err.name : "";
  const message = typeof err.message === "string" ? err.message : "";
  return (
    name === "ChunkLoadError" ||
    /loading chunk [^\s]+ failed/i.test(message) ||
    /loading css chunk/i.test(message) ||
    /failed to fetch dynamically imported module/i.test(message) ||
    /error loading dynamically imported module/i.test(message)
  );
}

function isStaticChunkUrl(url: string): boolean {
  return url.length > 0 && url.includes("/_next/static/");
}

export function ChunkErrorReloader() {
  useEffect(() => {
    function reloadOnce() {
      try {
        const last = Number(sessionStorage.getItem(RELOAD_AT_KEY) ?? "0");
        if (Number.isFinite(last) && Date.now() - last < RELOAD_COOLDOWN_MS) {
          // Already reloaded very recently; reloading again would risk a loop.
          return;
        }
        sessionStorage.setItem(RELOAD_AT_KEY, String(Date.now()));
      } catch {
        // sessionStorage unavailable: fall through to a single reload attempt.
      }
      window.location.reload();
    }

    function onError(event: ErrorEvent) {
      // Failed <script>/<link> chunk loads surface as capture-phase resource
      // errors whose target is the element (event.error is null).
      const target = event.target as
        | (HTMLElement & { src?: string; href?: string })
        | null;
      const resourceUrl = target?.src ?? target?.href ?? "";
      if (isChunkLoadError(event.error) || isStaticChunkUrl(resourceUrl)) {
        reloadOnce();
      }
    }

    function onRejection(event: PromiseRejectionEvent) {
      if (isChunkLoadError(event.reason)) {
        reloadOnce();
      }
    }

    // Capture phase so resource (script/css) load errors are observed too.
    window.addEventListener("error", onError, true);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError, true);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
