/** Scroll the document to the top (e.g. after filter URL replace). */
export function scrollRouteToTop(): void {
  if (typeof window === "undefined") return;
  window.scrollTo(0, 0);
}
