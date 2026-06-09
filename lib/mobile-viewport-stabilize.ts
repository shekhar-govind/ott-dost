/** Mobile/tablet — skip desktop where dynamic browser chrome is not an issue. */
export function shouldStabilizeViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 1023px)").matches;
}

/**
 * Mimics search-input focus on mobile Chrome: scroll to top and briefly focus a
 * readonly input so the address bar is expanded before the user scrolls.
 */
export async function stabilizeMobileViewport(
  anchor?: HTMLInputElement | null,
): Promise<void> {
  if (typeof window === "undefined") return;
  if (!shouldStabilizeViewport()) return;

  window.scrollTo(0, 0);

  const input =
    anchor ?? document.querySelector<HTMLInputElement>("[data-viewport-anchor]");
  if (input) {
    input.readOnly = true;
    input.focus({ preventScroll: true });
    input.readOnly = false;
    input.blur();
  }

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}
