"use client";

import { useCallback, useRef, useState } from "react";

export type SharePayload = {
  title?: string;
  text?: string;
  url?: string;
};

export type ShareStatus = "idle" | "copied" | "error";

function buildShareData(payload?: SharePayload): ShareData {
  const url = payload?.url ?? window.location.href;
  const title = payload?.title ?? document.title;
  const text = payload?.text;

  return {
    url,
    title,
    ...(text ? { text } : {}),
  };
}

export function useShare() {
  const [status, setStatus] = useState<ShareStatus>("idle");
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearStatusSoon = useCallback(() => {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => setStatus("idle"), 2000);
  }, []);

  const share = useCallback(
    async (payload?: SharePayload) => {
      const data = buildShareData(payload);

      if (typeof navigator !== "undefined" && navigator.share) {
        try {
          await navigator.share(data);
          setStatus("idle");
          return;
        } catch (err) {
          if (err instanceof DOMException && err.name === "AbortError") {
            return;
          }
        }
      }

      try {
        await navigator.clipboard.writeText(data.url ?? window.location.href);
        setStatus("copied");
        clearStatusSoon();
      } catch {
        setStatus("error");
        clearStatusSoon();
      }
    },
    [clearStatusSoon],
  );

  return { share, status };
}
