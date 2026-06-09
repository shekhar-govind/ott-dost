const SITE_SEARCH_INPUT_SELECTOR = "[data-site-search-input]";
const VIEWPORT_ANCHOR_SELECTOR = "[data-viewport-anchor]";
/** Time for mobile Chrome to expand the URL bar after input focus. */
const CHROME_SETTLE_MS = 80;

/** Mobile/tablet — skip desktop where dynamic browser chrome is not an issue. */
export function shouldStabilizeViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 1023px)").matches;
}

function findStabilizeInput(
  anchor?: HTMLInputElement | null,
): HTMLInputElement | null {
  return (
    document.querySelector<HTMLInputElement>(SITE_SEARCH_INPUT_SELECTOR) ??
    anchor ??
    document.querySelector<HTMLInputElement>(VIEWPORT_ANCHOR_SELECTOR)
  );
}

function waitForNextFrames(count = 2): Promise<void> {
  return new Promise((resolve) => {
    let remaining = count;
    const step = () => {
      remaining -= 1;
      if (remaining <= 0) resolve();
      else requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

function waitMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mimics search-input focus on mobile Chrome: scroll to top and briefly focus
 * the site search input (or fallback anchor) so the address bar is expanded
 * before navigation and before the user's first scroll.
 */
export async function stabilizeMobileViewport(
  anchor?: HTMLInputElement | null,
): Promise<void> {
  if (typeof window === "undefined") return;
  if (!shouldStabilizeViewport()) return;

  window.scrollTo(0, 0);

  const input = findStabilizeInput(anchor);
  if (input) {
    const wasReadOnly = input.readOnly;
    input.readOnly = true;
    // Allow browser scroll like a real search focus — expands Chrome's URL bar.
    input.focus();
    await waitMs(CHROME_SETTLE_MS);
    input.readOnly = wasReadOnly;
    input.blur();
  }

  await waitForNextFrames();
}
