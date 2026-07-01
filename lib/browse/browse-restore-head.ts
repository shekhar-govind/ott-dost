import { BROWSE_FILTERS_STORAGE_KEY } from "./filter-persistence";

/** Critical CSS so restore hide/show works before globals.css loads. */
export const BROWSE_RESTORE_HEAD_CSS = `
html.browse-restore-pending [data-home-browse-ssr] {
  display: none !important;
}
html.browse-restore-pending .browse-restore-skeleton {
  display: block !important;
}
`.trim();

/** Runs synchronously in <head> before body paint. */
export function getBrowseRestoreHeadScript(): string {
  return `
(function(){
  try {
    if (location.pathname !== "/") return;
    var search = location.search;
    var isBare = !search || search === "?type=movie";
    if (!isBare) return;
    var raw = localStorage.getItem(${JSON.stringify(BROWSE_FILTERS_STORAGE_KEY)});
    if (!raw || raw === "type=movie") return;
    document.documentElement.classList.add("browse-restore-pending");
  } catch (e) {}
})();
`.trim();
}
