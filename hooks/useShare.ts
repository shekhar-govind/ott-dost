"use client";

import { useCallback, useRef, useState } from "react";
import { SHARE_TEXT_SEPARATOR, type SharePayload } from "@/lib/share-payload";

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
  return [data.title, data.text, data.url]
    .filter(Boolean)
    .join(`\n${SHARE_TEXT_SEPARATOR}\n`);
}

async function fetchPosterFile(imageUrl: string): Promise<File | null> {
  const resolved = resolveShareUrl(imageUrl);

  try {
    const res = await fetch(resolved);
    if (!res.ok) return null;

    const blob = await res.blob();
    const ext = blob.type.includes("png") ? "png" : "jpg";
    return new File([blob], `poster.${ext}`, {
      type: blob.type || "image/jpeg",
    });
  } catch {
    return null;
  }
}

async function withPosterFile(
  data: ShareData,
  imageUrl: string | undefined,
): Promise<ShareData> {
  if (!imageUrl || typeof navigator.canShare !== "function") {
    return data;
  }

  const file = await fetchPosterFile(imageUrl);
  if (!file) return data;

  const withFiles: ShareData = {
    title: data.title,
    text: data.text,
    files: [file],
  };

  // Prefer poster file without URL — some agents attach the page logo when URL is set.
  if (navigator.canShare(withFiles)) {
    return withFiles;
  }

  const withFilesAndUrl: ShareData = { ...withFiles, url: data.url };
  if (navigator.canShare(withFilesAndUrl)) {
    return withFilesAndUrl;
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
