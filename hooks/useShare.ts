"use client";

import { useCallback, useRef, useState } from "react";
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

function buildShareData(payload?: SharePayload): ShareData {
  const url = resolveShareUrl(payload?.url);
  const title = payload?.title ?? document.title;
  const text = payload?.text;

  return {
    url,
    title,
    ...(text ? { text } : {}),
  };
}

function buildClipboardText(data: ShareData): string {
  return [data.title, data.text, data.url].filter(Boolean).join("\n\n");
}

async function withPosterFile(
  data: ShareData,
  imageUrl: string | undefined,
): Promise<ShareData> {
  if (!imageUrl || typeof navigator.canShare !== "function") {
    return data;
  }

  try {
    const res = await fetch(imageUrl);
    if (!res.ok) return data;

    const blob = await res.blob();
    const ext = blob.type.includes("png") ? "png" : "jpg";
    const file = new File([blob], `poster.${ext}`, {
      type: blob.type || "image/jpeg",
    });
    const withFiles: ShareData = { ...data, files: [file] };

    if (navigator.canShare(withFiles)) {
      return withFiles;
    }
  } catch {
    /* CORS or unsupported — share without image file */
  }

  return data;
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
          const shareData = await withPosterFile(data, payload?.imageUrl);
          await navigator.share(shareData);
          setStatus("idle");
          return;
        } catch (err) {
          if (err instanceof DOMException && err.name === "AbortError") {
            return;
          }
        }
      }

      try {
        await navigator.clipboard.writeText(buildClipboardText(data));
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
