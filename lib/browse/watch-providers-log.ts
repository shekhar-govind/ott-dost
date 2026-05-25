const PREFIX = "[watch-providers]";

let pendingCacheSkipped = 0;

function isDevLoggingEnabled(): boolean {
  return process.env.NODE_ENV !== "production";
}

/** Reset counters when browse filters change. */
export function resetWatchProvidersFetchLog(): void {
  pendingCacheSkipped = 0;
}

/** Accumulate titles satisfied from localStorage until the next debounced drain log. */
export function recordWatchProvidersCacheSkipped(count: number): void {
  if (count > 0) {
    pendingCacheSkipped += count;
  }
}

function takePendingCacheSkippedCount(): number {
  const count = pendingCacheSkipped;
  pendingCacheSkipped = 0;
  return count;
}

/** Dev log when scroll activity settles (debounced): network vs cache. */
export function logWatchProvidersScrollSettled(titlesFetching: number): void {
  if (!isDevLoggingEnabled()) return;

  console.log(`${PREFIX} scroll settled`, {
    titlesFetching,
    titlesSkippedFromCache: takePendingCacheSkippedCount(),
  });
}
