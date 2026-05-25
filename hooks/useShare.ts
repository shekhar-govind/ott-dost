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
  const rawText = payload?.text;
  const text =
    rawText && url ? appendShareUrlToShareBody(rawText, url) : rawText;

  const data: ShareData = {
    title,
    ...(text ? { text } : {}),
  };

  // Keep url only when it is not already in the message (avoids two links in WhatsApp etc.).
  if (url && !shareTextIncludesUrl(text, url)) {
    data.url = url;
  }

  return data;
}

function omitUrlWhenInText(data: ShareData): ShareData {
  if (!shareTextIncludesUrl(data.text, data.url ?? "")) {
    return data;
  }
  const { url: _url, ...rest } = data;
  return rest;
}

function buildClipboardText(data: ShareData, payload?: SharePayload): string {
  const body = payload?.clipboardText ?? data.text;
  if (!body) return data.url ?? "";
  if (!data.url || shareTextIncludesUrl(body, data.url)) return body;
  return appendShareUrlToShareBody(body, data.url);
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
  const base = omitUrlWhenInText(data);
  const candidates: ShareData[] = [];

  if (file) {
    candidates.push({ title: base.title, text: base.text, files: [file] });
  }
  if (base.url) {
    if (file) {
      candidates.push({
        title: base.title,
        text: base.text,
        url: base.url,
        files: [file],
      });
    }
    candidates.push({ title: base.title, text: base.text, url: base.url });
  }
  candidates.push(base);

  for (const candidate of candidates) {
    if (canShareData(candidate)) {
      return candidate;
    }
  }

  return base;
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
