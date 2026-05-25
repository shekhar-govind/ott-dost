"use client";

import { useCallback, useRef, useState } from "react";
import { appendShareUrlToShareBody } from "@/lib/build-title-share-payload";
import type { SharePayload } from "@/lib/share-payload";

export type { SharePayload } from "@/lib/share-payload";

export type ShareStatus = "idle" | "copied" | "error";

function resolveShareUrl(url: string | undefined): string {
  const raw = url ?? window.location.href;
  if (raw.startsWith("/")) {
    return `${window.location.origin}${raw}`;
  }
  return raw;
}

function shareTextIncludesUrl(text: string | undefined, url: string): boolean {
  return Boolean(text && url && text.includes(url));
}

function buildShareData(payload?: SharePayload): ShareData {
  const url = resolveShareUrl(payload?.url);
  const title = payload?.title ?? document.title;
  const text = payload?.text;

  const data: ShareData = {
    title,
    ...(text ? { text } : {}),
  };

  if (url) {
    data.url = url;
  }

  return data;
}

function buildClipboardText(data: ShareData, payload?: SharePayload): string {
  const body = payload?.clipboardText ?? data.text;
  if (!body) return data.url ?? "";
  if (!data.url || shareTextIncludesUrl(body, data.url)) return body;
  return appendShareUrlToShareBody(body, data.url);
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
        await navigator.clipboard.writeText(buildClipboardText(data, payload));
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
