import {
  SHARE_PIPE,
  SHARE_TEXT_SEPARATOR,
  type SharePayload,
} from "@/lib/share-payload";
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

function joinShareBlocks(blocks: string[]): string {
  return blocks.filter(Boolean).join(`\n${SHARE_TEXT_SEPARATOR}\n`);
}

/** Compact line for OG / share subtitle: "Watch {title} | OTT Dost". */
export function buildTitleSharePreviewText(detail: TitleDetail): string {
  return buildWatchBrandLine(detail);
}

export function buildTitleShareText(
  detail: TitleDetail,
  shareUrl: string,
): string {
  const overview = detail.overview?.trim();

  const lines = [appendShareUrlToHeadline(buildWatchBrandLine(detail), shareUrl)];
  if (overview) {
    lines.push(clip(overview, 200));
  }

  return joinShareBlocks(lines);
}

export function buildTitleSharePayload(detail: TitleDetail): SharePayload {
  const path = buildTitlePath(detail.mediaType, detail.id, detail.title);
  const baseUrl = getSiteBaseUrl();
  const url = baseUrl ? `${baseUrl}${path}` : path;
  const shareUrl = url.startsWith("http") ? url : "";

  return {
    title: buildWatchBrandLine(detail),
    text: buildWatchBrandLine(detail),
    clipboardText: buildTitleShareText(detail, shareUrl),
    url,
  };
}
