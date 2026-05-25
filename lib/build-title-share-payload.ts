import type { SharePayload } from "@/lib/share-payload";
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

function formatWatchLine(detail: TitleDetail): string {
  const names = detail.watchAvailability.stream.map((p) => p.name);
  if (names.length > 0) {
    const list = names.slice(0, 4).join(", ");
    const more = names.length > 4 ? ` +${names.length - 4} more` : "";
    return `Stream on ${list}${more} in India`;
  }
  return "Find where to watch in India on OTT Dost";
}

export function buildTitleSharePayload(detail: TitleDetail): SharePayload {
  const path = buildTitlePath(detail.mediaType, detail.id, detail.title);
  const baseUrl = getSiteBaseUrl();
  const url = baseUrl ? `${baseUrl}${path}` : path;

  const headline = detail.year
    ? `${detail.title} (${detail.year})`
    : detail.title;
  const mediaLabel = detail.mediaType === "movie" ? "Movie" : "TV show";

  const overview = detail.overview?.trim();
  const textParts = [
    `${mediaLabel} · ${formatWatchLine(detail)}`,
    overview ? clip(overview, 220) : null,
  ].filter((line): line is string => Boolean(line));

  return {
    title: `${headline} — OTT Dost`,
    text: textParts.join("\n\n"),
    url,
    imageUrl: detail.posterUrl ?? undefined,
  };
}
