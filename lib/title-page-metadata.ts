import type { Metadata } from "next";
import { getTitleDetailCached } from "@/lib/get-title-detail-cached";
import { buildTitlePath } from "@/lib/title-url";
import type { TmdbMediaType } from "@/lib/tmdb/types";

function clip(text: string, max: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

export async function buildTitlePageMetadata(
  mediaType: TmdbMediaType,
  idParam: string,
  slugParam: string,
): Promise<Metadata> {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) {
    return { title: "Title not found | OTT Dost" };
  }

  const detail = await getTitleDetailCached(mediaType, id);
  if (!detail) {
    return { title: "Title not found | OTT Dost" };
  }

  const canonicalPath = buildTitlePath(mediaType, id, detail.title);
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";

  const headline = `${detail.title}${detail.year ? ` (${detail.year})` : ""}`;
  const title = `Watch ${headline} — where to watch in India | OTT Dost`;

  const descriptionSource =
    detail.overview?.trim() ||
    `${detail.title}: streaming, rent, and buy options in India on OTT Dost.`;

  return {
    title,
    description: clip(descriptionSource, 155),
    alternates: {
      canonical: baseUrl ? `${baseUrl}${canonicalPath}` : canonicalPath,
    },
    openGraph: {
      title,
      description: clip(descriptionSource, 200),
      type: "website",
      ...(detail.posterUrl
        ? {
            images: [
              {
                url: detail.posterUrl,
                width: 500,
                height: 750,
                alt: `${detail.title} poster`,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: clip(descriptionSource, 200),
      ...(detail.posterUrl ? { images: [detail.posterUrl] } : {}),
    },
    // Beta: was only noindex for non-canonical URLs; block all until launch.
    robots: { index: false, follow: false },
  };
}
