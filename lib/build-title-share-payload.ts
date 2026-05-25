import { SHARE_TEXT_SEPARATOR, type SharePayload } from "@/lib/share-payload";
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

function joinShareBlocks(blocks: string[]): string {
  return blocks.filter(Boolean).join(`\n${SHARE_TEXT_SEPARATOR}\n`);
}

/** Text for the mobile share drawer (Watch headline + brand). */
export function buildTitleSharePreviewText(detail: TitleDetail): string {
  const watchHeadline = buildWatchHeadline(detail);
  return `${watchHeadline}\n${BRAND}`;
}

export function buildTitleShareText(detail: TitleDetail): string {
  const watchHeadline = buildWatchHeadline(detail);
  const overview = detail.overview?.trim();

  const lines = [watchHeadline, BRAND];
  if (overview) {
    lines.push(clip(overview, 200));
  }

  return joinShareBlocks(lines);
}

export function buildTitleSharePayload(detail: TitleDetail): SharePayload {
  const path = buildTitlePath(detail.mediaType, detail.id, detail.title);
  const baseUrl = getSiteBaseUrl();
  const url = baseUrl ? `${baseUrl}${path}` : path;

  const watchHeadline = buildWatchHeadline(detail);

  const posterProxyPath =
    detail.posterUrl != null
      ? buildSharePosterProxyPath(detail.mediaType, detail.id)
      : undefined;

  return {
    title: watchHeadline,
    text: buildTitleSharePreviewText(detail),
    clipboardText: buildTitleShareText(detail),
    url,
    imageUrl: posterProxyPath,
  };
}
