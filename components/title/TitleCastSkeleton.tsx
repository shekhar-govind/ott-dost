export function TitleCastSkeleton() {
  return (
    <section className="mt-6" aria-busy="true" aria-label="Loading cast">
      <div className="h-3.5 w-10 animate-pulse rounded bg-zinc-100 motion-reduce:animate-none" />
      <ul className="mt-3 flex gap-3 overflow-hidden" aria-hidden>
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className="w-[4.75rem] shrink-0 sm:w-24">
            <div
              className="aspect-square w-full animate-pulse rounded-lg bg-zinc-100 motion-reduce:animate-none"
              style={{ animationDelay: `${i * 60}ms` }}
            />
            <div className="mt-2 h-3 w-full animate-pulse rounded bg-zinc-100/90 motion-reduce:animate-none" />
            <div className="mt-1 h-2.5 w-4/5 animate-pulse rounded bg-zinc-100/80 motion-reduce:animate-none" />
          </li>
        ))}
      </ul>
    </section>
  );
}
