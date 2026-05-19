import { TitlePeopleSkeleton } from "./TitlePeopleSkeleton";
import { TitleRecommendationsSkeleton } from "./TitleRecommendationsSkeleton";
import { TitleWatchSkeleton } from "./TitleWatchSkeleton";

/**
 * Mirrors title page layout for instant route feedback while the RSC payload streams in.
 */
export function TitlePageSkeleton() {
  return (
    <>
      <article
        className="mt-8 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
        aria-busy="true"
        aria-label="Loading title"
      >
        <div
          className="h-36 w-full animate-pulse bg-zinc-100 motion-reduce:animate-none sm:h-44"
          aria-hidden
        />

        <div className="relative z-10 px-4 pb-4 sm:px-6 sm:pb-6">
          <div className="-mt-10 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-start sm:gap-6">
            <div
              className="mx-auto h-48 w-32 shrink-0 animate-pulse rounded-lg bg-zinc-100 shadow-lg ring-1 ring-zinc-200/80 motion-reduce:animate-none sm:mx-0 sm:h-56 sm:w-36"
              aria-hidden
            />

            <div className="min-w-0 flex-1 space-y-3">
              <header className="space-y-2">
                <div className="h-7 w-[min(100%,14rem)] animate-pulse rounded-md bg-zinc-100 motion-reduce:animate-none sm:h-8" />
                <div className="h-3.5 w-40 max-w-full animate-pulse rounded bg-zinc-100/80 motion-reduce:animate-none" />
                <div className="h-3 w-56 max-w-full animate-pulse rounded bg-zinc-100/70 motion-reduce:animate-none" />
                <div className="h-3 w-48 max-w-full animate-pulse rounded bg-zinc-100/90 motion-reduce:animate-none" />
              </header>

              <ul className="flex flex-wrap gap-2 pt-1" aria-hidden>
                {Array.from({ length: 3 }).map((_, i) => (
                  <li
                    key={i}
                    className="h-7 w-16 animate-pulse rounded-full bg-zinc-100 motion-reduce:animate-none"
                    style={{ animationDelay: `${i * 75}ms` }}
                  />
                ))}
              </ul>

              <div className="space-y-2 pt-1" aria-hidden>
                <div className="h-3.5 w-full animate-pulse rounded bg-zinc-100 motion-reduce:animate-none" />
                <div className="h-3.5 w-full animate-pulse rounded bg-zinc-100 motion-reduce:animate-none" />
                <div className="h-3.5 w-[88%] animate-pulse rounded bg-zinc-100 motion-reduce:animate-none" />
              </div>
            </div>
          </div>
        </div>
      </article>
      <TitleWatchSkeleton />
      <TitlePeopleSkeleton />
      <TitleRecommendationsSkeleton />
    </>
  );
}
