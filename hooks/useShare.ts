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

function buildClipboardText(data: ShareData, payload?: SharePayload): string {
  const body = payload?.clipboardText ?? data.text;
  return [body, data.url]
    .filter((part): part is string => Boolean(part))
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

function canShareData(data: ShareData): boolean {
  return (
    typeof navigator === "undefined" ||
    typeof navigator.canShare !== "function" ||
    navigator.canShare(data)
  );
}

async function buildNativeShareData(
  data: ShareData,
  imageUrl: string | undefined,
): Promise<ShareData> {
  const file = imageUrl ? await fetchPosterFile(imageUrl) : null;

  const candidates: ShareData[] = file
    ? [
        { title: data.title, text: data.text, url: data.url, files: [file] },
        { title: data.title, text: data.text, url: data.url },
        { title: data.title, text: data.text, files: [file] },
      ]
    : [{ title: data.title, text: data.text, url: data.url }];

  for (const candidate of candidates) {
    if (canShareData(candidate)) {
      return candidate;
    }
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
          const shareData = await buildNativeShareData(data, payload?.imageUrl);
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
