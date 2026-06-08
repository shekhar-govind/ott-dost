import { BROWSE_FILTERS_STORAGE_KEY } from "@/lib/browse/filter-persistence";
import Script from "next/script";

const browseRestoreScript = `
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
`;

export function BrowseRestoreScript() {
  return (
    <Script
      id="browse-restore-pending"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: browseRestoreScript }}
    />
  );
}
