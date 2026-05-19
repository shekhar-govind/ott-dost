export function TitleRecommendationsSkeleton() {
  return (
    <article
      className="mt-3 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
      aria-busy="true"
      aria-label="Loading recommendations"
    >
      <div className="border-b border-zinc-100 px-4 py-3 sm:px-6">
        <div className="h-3.5 w-28 animate-pulse rounded bg-zinc-100 motion-reduce:animate-none" />
      </div>
      <ul className="divide-y divide-zinc-100" aria-hidden>
        {Array.from({ length: 4 }).map((_, i) => (
          <li key={i} className="flex gap-3 px-3 py-3 sm:px-4">
            <div
              className="h-[4.5rem] w-12 shrink-0 animate-pulse rounded-md bg-zinc-100 motion-reduce:animate-none sm:h-[5.25rem] sm:w-14"
              style={{ animationDelay: `${i * 50}ms` }}
            />
            <div className="min-w-0 flex-1 space-y-2 pt-0.5">
              <div className="h-4 w-2/3 max-w-[12rem] animate-pulse rounded bg-zinc-100 motion-reduce:animate-none" />
              <div className="h-3 w-1/2 max-w-[8rem] animate-pulse rounded bg-zinc-100/90 motion-reduce:animate-none" />
              <div className="h-3 w-full max-w-md animate-pulse rounded bg-zinc-100/80 motion-reduce:animate-none" />
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}
