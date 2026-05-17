export function TitleSummarySkeleton() {
  return (
    <div
      className="mt-8 animate-pulse rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6"
      aria-hidden
    >
      <div className="flex gap-4 sm:gap-6">
        <div className="h-36 w-24 shrink-0 rounded-lg bg-zinc-200 sm:h-48 sm:w-32" />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="h-6 w-2/3 rounded bg-zinc-200" />
          <div className="h-4 w-1/2 rounded bg-zinc-100" />
          <div className="space-y-2 pt-2">
            <div className="h-3 w-full rounded bg-zinc-100" />
            <div className="h-3 w-full rounded bg-zinc-100" />
            <div className="h-3 w-4/5 rounded bg-zinc-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
