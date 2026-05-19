export function TitleTrailerSkeleton() {
  return (
    <article
      className="mt-3 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
      aria-busy="true"
      aria-label="Loading trailer"
    >
      <div className="p-4 sm:p-6" aria-hidden>
        <div className="h-3.5 w-14 animate-pulse rounded bg-zinc-100 motion-reduce:animate-none" />
        <div className="mt-3 aspect-video animate-pulse rounded-xl bg-zinc-100 motion-reduce:animate-none" />
        <div className="mt-3 h-4 w-40 animate-pulse rounded bg-zinc-100 motion-reduce:animate-none" />
        <div className="mt-2 h-3 w-56 max-w-full animate-pulse rounded bg-zinc-100/90 motion-reduce:animate-none" />
      </div>
    </article>
  );
}
