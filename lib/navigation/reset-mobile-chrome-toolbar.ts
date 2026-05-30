export function resetMobileChromeToolbar(targetY = 0): void {
  if (typeof window === "undefined") return;
  if (!window.matchMedia("(pointer: coarse)").matches) return;

  window.scrollTo(0, targetY + 1);
  requestAnimationFrame(() => window.scrollTo(0, targetY));
}
