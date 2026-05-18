import { buildListMetaLine } from "@/lib/tmdb/utils";
import type { TitleDetail } from "@/lib/tmdb/types";
import { TitleSummaryProviders } from "./TitleSummaryProviders";

interface TitleSummaryProps {
  detail: TitleDetail;
  /** `page`: standalone route (h1). `panel`: inline summary (h3). */
  variant?: "page" | "panel";
}

export function TitleSummary({
  detail,
  variant = "panel",
}: TitleSummaryProps) {
  const titleClass =
    "text-pretty text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl";
  const metaLine = [
    buildListMetaLine({
      mediaType: detail.mediaType,
      rating: detail.rating,
      releaseDate: detail.releaseDate,
      languageLabel: detail.languageLabel,
    }),
    detail.runtime,
    detail.status,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="mt-8 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:gap-6">
        <Poster posterUrl={detail.posterUrl} title={detail.title} />

        <div className="min-w-0 flex-1">
          <header className="min-w-0">
            {variant === "page" ? (
              <h1 className={titleClass}>{detail.title}</h1>
            ) : (
              <h3 className={titleClass}>{detail.title}</h3>
            )}
            {metaLine ? (
              <p className="mt-px min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[11px] leading-tight tabular-nums text-zinc-400">
                {metaLine}
              </p>
            ) : null}
          </header>

          {detail.genres.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {detail.genres.map((genre) => (
                <li
                  key={genre}
                  className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600"
                >
                  {genre}
                </li>
              ))}
            </ul>
          )}

          {detail.overview ? (
            <p className="mt-4 text-pretty text-sm leading-relaxed text-zinc-600 sm:text-base">
              {detail.overview}
            </p>
          ) : (
            <p className="mt-4 text-sm text-zinc-500">No synopsis available.</p>
          )}

          <div className="mt-5 border-t border-zinc-100 pt-5">
            <TitleSummaryProviders availability={detail.watchAvailability} />
          </div>
        </div>
      </div>
    </article>
  );
}

function Poster({
  posterUrl,
  title,
}: {
  posterUrl: string | null;
  title: string;
}) {
  if (posterUrl) {
    return (
      <img
        src={posterUrl}
        alt={`${title} poster`}
        width={128}
        height={192}
        className="mx-auto h-48 w-32 shrink-0 rounded-lg object-cover bg-zinc-100 sm:mx-0 sm:h-56 sm:w-36"
      />
    );
  }

  return (
    <div className="mx-auto flex h-48 w-32 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-2xl font-medium text-zinc-400 sm:mx-0 sm:h-56 sm:w-36">
      {title.slice(0, 1).toUpperCase()}
    </div>
  );
}
