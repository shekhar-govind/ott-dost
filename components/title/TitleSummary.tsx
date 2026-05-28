import type { TitleDetail } from "@/lib/tmdb/types";
import { TitleSummaryBackdrop } from "./TitleSummaryBackdrop";
import { TitleSummaryHeader } from "./TitleSummaryHeader";
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
  const backdropUrl =
    variant === "page" ? detail.backdropUrl : null;

  if (backdropUrl) {
    return (
      <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-none sm:shadow-sm">
        <TitleSummaryBackdrop backdropUrl={backdropUrl} title={detail.title} />

        <div className="relative z-10 px-4 pb-4 sm:px-6 sm:pb-6">
          <div className="-mt-10 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-start sm:gap-6">
            <Poster posterUrl={detail.posterUrl} title={detail.title} overlapsBackdrop />

            <div className="min-w-0 flex-1">
              <TitleSummaryBody detail={detail} variant={variant} />
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-none sm:p-6 sm:shadow-sm">
      <div className="flex flex-col gap-5 sm:flex-row sm:gap-6">
        <Poster posterUrl={detail.posterUrl} title={detail.title} />

        <div className="min-w-0 flex-1">
          <TitleSummaryBody detail={detail} variant={variant} />
        </div>
      </div>
    </article>
  );
}

function TitleSummaryBody({
  detail,
  variant,
}: {
  detail: TitleDetail;
  variant: "page" | "panel";
}) {
  return (
    <>
      <TitleSummaryHeader detail={detail} variant={variant} />

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

      {variant === "panel" ? (
        <div className="mt-5 border-t border-zinc-100 pt-5">
          <TitleSummaryProviders availability={detail.watchAvailability} />
        </div>
      ) : null}
    </>
  );
}

function Poster({
  posterUrl,
  title,
  overlapsBackdrop = false,
}: {
  posterUrl: string | null;
  title: string;
  overlapsBackdrop?: boolean;
}) {
  const className = overlapsBackdrop
    ? "mx-auto h-48 w-32 shrink-0 rounded-lg object-cover bg-zinc-100 ring-1 ring-zinc-200/80 shadow-none sm:mx-0 sm:h-56 sm:w-36 sm:shadow-lg"
    : "mx-auto h-48 w-32 shrink-0 rounded-lg object-cover bg-zinc-100 sm:mx-0 sm:h-56 sm:w-36";

  if (posterUrl) {
    return (
      <img
        src={posterUrl}
        alt={`${title} poster`}
        width={128}
        height={192}
        className={className}
      />
    );
  }

  return (
    <div
      className={
        overlapsBackdrop
          ? "mx-auto flex h-48 w-32 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-2xl font-medium text-zinc-400 ring-1 ring-zinc-200/80 shadow-none sm:mx-0 sm:h-56 sm:w-36 sm:shadow-lg"
          : "mx-auto flex h-48 w-32 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-2xl font-medium text-zinc-400 sm:mx-0 sm:h-56 sm:w-36"
      }
    >
      {title.slice(0, 1).toUpperCase()}
    </div>
  );
}
