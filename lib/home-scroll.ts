export const HOME_SCROLL_KEY = "ott-dost:home-scroll-y";
const HISTORY_SCROLL_KEY = "__OTT_HOME_SCROLL";

/** Best-effort current vertical scroll (viewport vs document quirks). */
function readScrollY(): number {
  if (typeof window === "undefined") return 0;
  const root = document.scrollingElement ?? document.documentElement;
  return Math.max(
    window.scrollY,
    window.pageYOffset,
    root.scrollTop,
    document.body.scrollTop,
  );
}

function mergeHistoryState(patch: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  const prev = window.history.state;
  const base =
    prev !== null && typeof prev === "object" && !Array.isArray(prev)
      ? { ...(prev as Record<string, unknown>) }
      : {};
  window.history.replaceState(
    { ...base, ...patch },
    "",
    window.location.href,
  );
}

export function saveHomeScrollPosition(): void {
  const y = readScrollY();
  try {
    sessionStorage.setItem(HOME_SCROLL_KEY, String(y));
  } catch {
    /* private mode / quota */
  }

  if (typeof window !== "undefined" && window.location.pathname === "/") {
    try {
      mergeHistoryState({ [HISTORY_SCROLL_KEY]: y });
    } catch {
      /* ignore */
    }
  }
}

export function readHomeScrollFromHistoryState(): number | null {
  if (typeof window === "undefined") return null;
  const s = window.history.state;
  if (!s || typeof s !== "object") return null;
  const raw = (s as Record<string, unknown>)[HISTORY_SCROLL_KEY];
  if (typeof raw !== "number" || !Number.isFinite(raw) || raw < 0) return null;
  return raw;
}

export function readHomeScrollPosition(): number | null {
  try {
    const raw = sessionStorage.getItem(HOME_SCROLL_KEY);
    if (raw == null) return null;
    const y = Number(raw);
    if (!Number.isFinite(y) || y < 0) return null;
    return y;
  } catch {
    return null;
  }
}

export function readSavedHomeScroll(): number | null {
  return readHomeScrollPosition() ?? readHomeScrollFromHistoryState();
}

/** Apply scroll to every layer some browsers use for the document. */
export function restoreHomeScrollPixel(y: number): void {
  window.scrollTo(0, y);

  const root = document.scrollingElement;
  if (root) {
    root.scrollTop = y;
  }
  document.documentElement.scrollTop = y;
  document.body.scrollTop = y;
}

/**
 * Keep applying scroll until the document is tall enough to reach `targetY`
 * (fixes restore while BrowseList is still reflowing after `display:none`).
 */
export function restoreHomeScrollWhenLayoutReady(
  targetY: number,
  maxWaitMs = 4000,
): () => void {
  const start = performance.now();
  let raf = 0;

  const tick = () => {
    const el = document.documentElement;
    const maxScroll = Math.max(0, el.scrollHeight - window.innerHeight);
    const y = Math.min(Math.max(0, targetY), maxScroll);
    restoreHomeScrollPixel(y);

    const tallEnough = maxScroll >= targetY - 1;
    const timedOut = performance.now() - start > maxWaitMs;

    if (!tallEnough && !timedOut) {
      raf = requestAnimationFrame(tick);
    }
  };

  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}
