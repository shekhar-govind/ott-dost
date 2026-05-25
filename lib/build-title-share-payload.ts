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

function formatProviderList(names: string[], max = 5): string {
  const slice = names.slice(0, max);
  const more = names.length > max ? ` +${names.length - max} more` : "";
  return `${slice.join(", ")}${more}`;
}

function formatAvailabilityLine(detail: TitleDetail): string {
  const { stream, rent, buy } = detail.watchAvailability;
  const streamNames = stream.map((p) => p.name);
  if (streamNames.length > 0) {
    return `Stream on ${formatProviderList(streamNames)} in India`;
  }

  const rentNames = rent.map((p) => p.name);
  if (rentNames.length > 0) {
    return `Rent on ${formatProviderList(rentNames)} in India`;
  }

  const buyNames = buy.map((p) => p.name);
  if (buyNames.length > 0) {
    return `Buy on ${formatProviderList(buyNames)} in India`;
  }

  return "Find where to watch in India";
}

/** Text for the mobile share drawer (Watch headline + existing preview line). */
export function buildTitleSharePreviewText(detail: TitleDetail): string {
  const watchHeadline = buildWatchHeadline(detail);
  const metaLine = `${BRAND} · ${formatAvailabilityLine(detail)}`;
  return `${watchHeadline}\n${metaLine}`;
}

export function buildTitleShareText(detail: TitleDetail): string {
  const watchHeadline = buildWatchHeadline(detail);
  const overview = detail.overview?.trim();

  const lines = [watchHeadline, BRAND, formatAvailabilityLine(detail)];
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
