export function TitleWatchSkeleton() {
  return (
    <article
      className="mt-3 rounded-2xl border border-zinc-200 bg-zinc-50/80 shadow-sm"
      aria-busy="true"
      aria-label="Loading where to watch"
    >
      <div className="p-4 sm:p-6" aria-hidden>
        <div className="mb-3 h-3.5 w-36 animate-pulse rounded bg-zinc-100 motion-reduce:animate-none" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-9 w-20 animate-pulse rounded-lg bg-zinc-100 motion-reduce:animate-none"
              style={{ animationDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
      </div>
    </article>
  );
}
