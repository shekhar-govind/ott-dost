import { buildListMetaLine } from "@/lib/tmdb/utils";
import type { TitleDetail } from "@/lib/tmdb/types";

interface TitleSummaryHeaderProps {
  detail: TitleDetail;
  variant: "page" | "panel";
}

export function TitleSummaryHeader({ detail, variant }: TitleSummaryHeaderProps) {
  const titleClass =
    "text-pretty text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl";
  const hasSubtitle = Boolean(detail.originalTitle || detail.tagline);
  const metaLine = [
    buildListMetaLine({
      mediaType: detail.mediaType,
      rating: detail.rating,
      voteCount: detail.voteCount,
      releaseDate: detail.releaseDate,
      languageLabel: detail.languageLabel,
      ageRating: detail.ageRating,
    }),
    detail.runtime,
    detail.status,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <header className="min-w-0">
      {variant === "page" ? (
        <h1 className={titleClass}>{detail.title}</h1>
      ) : (
        <h3 className={titleClass}>{detail.title}</h3>
      )}
      {detail.originalTitle ? (
        <p className="mt-0.5 text-pretty text-sm text-zinc-500">{detail.originalTitle}</p>
      ) : null}
      {detail.tagline ? (
        <p className="mt-1 line-clamp-2 text-pretty text-sm italic text-zinc-500">
          {detail.tagline}
        </p>
      ) : null}
      {metaLine ? (
        <p
          className={`text-pretty text-[11px] leading-tight tabular-nums text-zinc-400 ${hasSubtitle ? "mt-1" : "mt-px"}`}
        >
          {metaLine}
        </p>
      ) : null}
    </header>
  );
}
