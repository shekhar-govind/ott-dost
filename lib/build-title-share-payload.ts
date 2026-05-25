import {
  SHARE_PIPE,
  SHARE_TEXT_SEPARATOR,
  type SharePayload,
} from "@/lib/share-payload";
import { buildSharePosterProxyPath } from "@/lib/share-poster-url";
import { buildTitlePath } from "@/lib/title-url";
import type { TitleDetail } from "@/lib/tmdb/types";

function clip(text: string, max: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

export function getSiteBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
}

export function buildWatchHeadline(detail: TitleDetail): string {
  const name = detail.year ? `${detail.title} (${detail.year})` : detail.title;
  return `Watch ${name}`;
}

const BRAND = "OTT Dost";

export function buildWatchBrandLine(detail: TitleDetail): string {
  return `${buildWatchHeadline(detail)}${SHARE_PIPE}${BRAND}`;
}

export function appendShareUrlToHeadline(headline: string, url: string): string {
  if (!url || headline.includes(url)) return headline;
  return `${headline}${SHARE_PIPE}${url}`;
}

export function appendShareUrlToShareBody(body: string, url: string): string {
  const sep = `\n${SHARE_TEXT_SEPARATOR}\n`;
  const parts = body.split(sep);
  if (parts.length === 0) return appendShareUrlToHeadline(body, url);
  parts[0] = appendShareUrlToHeadline(parts[0], url);
  return parts.join(sep);
}

function firstSentence(text: string): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  const match = normalized.match(/^[^.!?]+[.!?]?/);
  return match ? match[0].trim() : normalized;
}

/** First overview sentence for native share `text`, clipped with an ellipsis when long. */
export function buildTitleShareOverviewText(detail: TitleDetail): string | undefined {
  const overview = detail.overview?.trim();
  if (!overview) return undefined;
  return clip(firstSentence(overview), 200);
}

/** Compact line for OG / share subtitle: "Watch {title} | OTT Dost". */
export function buildTitleSharePreviewText(detail: TitleDetail): string {
  return buildWatchBrandLine(detail);
}

/** Clipboard body: brand headline and page link only (no overview). */
export function buildTitleShareClipboardText(
  detail: TitleDetail,
  shareUrl: string,
): string {
  return appendShareUrlToHeadline(buildWatchBrandLine(detail), shareUrl);
}

export function buildTitleSharePayload(detail: TitleDetail): SharePayload {
  const path = buildTitlePath(detail.mediaType, detail.id, detail.title);
  const baseUrl = getSiteBaseUrl();
  const url = baseUrl ? `${baseUrl}${path}` : path;
  const shareUrl = url.startsWith("http") ? url : "";

  const posterProxyPath =
    detail.posterUrl != null
      ? buildSharePosterProxyPath(detail.mediaType, detail.id)
      : undefined;

  return {
    title: buildWatchBrandLine(detail),
    text: buildTitleShareOverviewText(detail),
    clipboardText: buildTitleShareClipboardText(detail, shareUrl),
    url,
    imageUrl: posterProxyPath,
  };
}
