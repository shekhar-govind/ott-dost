export function TitlePeopleSkeleton() {
  return (
    <article
      className="mt-3 rounded-2xl border border-zinc-200 bg-white shadow-sm"
      aria-busy="true"
      aria-label="Loading cast and crew"
    >
      <div className="p-4 sm:p-6">
        <div className="h-3.5 w-24 animate-pulse rounded bg-zinc-100 motion-reduce:animate-none" />
        <div className="mt-4" aria-hidden>
          <div className="h-3 w-10 animate-pulse rounded bg-zinc-100/90 motion-reduce:animate-none" />
          <ul className="mt-2 flex gap-3 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className="w-[4.75rem] shrink-0 sm:w-24">
                <div
                  className="aspect-square w-full animate-pulse rounded-lg bg-zinc-100 motion-reduce:animate-none"
                  style={{ animationDelay: `${i * 60}ms` }}
                />
                <div className="mt-2 h-3 w-full animate-pulse rounded bg-zinc-100/90 motion-reduce:animate-none" />
              </li>
            ))}
          </ul>
        </div>
        <div
          className="mt-4 flex h-5 w-20 animate-pulse rounded bg-zinc-100/80 motion-reduce:animate-none"
          aria-hidden
        />
      </div>
    </article>
  );
}
