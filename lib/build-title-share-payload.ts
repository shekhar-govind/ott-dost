import {
  SHARE_PIPE,
  SHARE_TEXT_SEPARATOR,
  type SharePayload,
} from "@/lib/share-payload";
import {
  buildSharePosterAbsoluteUrl,
  buildSharePosterProxyPath,
  SHARE_POSTER_TMDB_SIZE,
} from "@/lib/share-poster-url";
import { getSiteBaseUrl } from "@/lib/site-url";
import { buildTitlePath } from "@/lib/title-url";
import type { TitleDetail } from "@/lib/tmdb/types";

export { getSiteBaseUrl } from "@/lib/site-url";

function clip(text: string, max: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

export function buildWatchHeadline(detail: TitleDetail): string {
  const name = detail.year ? `${detail.title} (${detail.year})` : detail.title;
  return `Watch ${name}`;
}

const BRAND = "OTT Dost";

export function buildWatchBrandLine(detail: TitleDetail): string {
  return `${buildWatchHeadline(detail)}${SHARE_PIPE}${BRAND}`;
}

/** Native share title: "Watch {title} | OTT Dost" (no year). */
export function buildShareTitleLine(detail: TitleDetail): string {
  return `Watch ${detail.title}${SHARE_PIPE}${BRAND}`;
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

const SHARE_OVERVIEW_MAX = 200;

/** Divider between headline and overview in native share `text`. */
export const SHARE_TEXT_OVERVIEW_DIVIDER = "---";

function buildTitleShareHeadline(detail: TitleDetail): string {
  const name = detail.year ? `${detail.title} (${detail.year})` : detail.title;
  return `${name} - where to watch in India${SHARE_PIPE}${BRAND}`;
}

/** Native share `text`: headline, ---, first overview sentence (with ellipsis). */
export function buildTitleShareTextField(detail: TitleDetail): string {
  const headline = buildTitleShareHeadline(detail);
  const overview = buildTitleShareOverviewText(detail);
  if (!overview) return headline;
  return `${headline}\n${SHARE_TEXT_OVERVIEW_DIVIDER}\n${overview}`;
}

/** First overview sentence for native share, with an ellipsis after it. */
export function buildTitleShareOverviewText(detail: TitleDetail): string | undefined {
  const overview = detail.overview?.trim();
  if (!overview) return undefined;

  const sentence = firstSentence(overview);
  if (sentence.length > SHARE_OVERVIEW_MAX) {
    return clip(sentence, SHARE_OVERVIEW_MAX);
  }
  return `${sentence}…`;
}

/** Compact line for OG / share subtitle: "Watch {title} | OTT Dost". */
export function buildTitleSharePreviewText(detail: TitleDetail): string {
  return buildWatchBrandLine(detail);
}

/** Clipboard body: headline with India and page link. */
export function buildTitleShareClipboardText(
  detail: TitleDetail,
  shareUrl: string,
): string {
  return appendShareUrlToHeadline(buildTitleShareHeadline(detail), shareUrl);
}

export function buildTitleSharePayload(detail: TitleDetail): SharePayload {
  const path = buildTitlePath(detail.mediaType, detail.id, detail.title);
  const baseUrl = getSiteBaseUrl();
  const url = baseUrl ? `${baseUrl}${path}` : path;
  const shareUrl = url.startsWith("http") ? url : "";

  const posterImageUrl =
    detail.posterUrl != null
      ? baseUrl
        ? buildSharePosterAbsoluteUrl(
            detail.mediaType,
            detail.id,
            baseUrl,
            SHARE_POSTER_TMDB_SIZE,
          )
        : buildSharePosterProxyPath(detail.mediaType, detail.id)
      : undefined;

  return {
    title: buildShareTitleLine(detail),
    text: buildTitleShareTextField(detail),
    clipboardText: buildTitleShareClipboardText(detail, shareUrl),
    url,
    imageUrl: posterImageUrl,
  };
}
