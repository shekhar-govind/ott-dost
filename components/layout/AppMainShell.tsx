"use client";

import { SiteSearchPanel } from "@/components/search/SiteSearchPanel";
import { isTitleDetailPath } from "@/lib/title-detail-path";
import { isBrowseSpecialPathname } from "@/lib/browse/is-browse-special-path";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";

function usesSearchShell(pathname: string): boolean {
  return (
    pathname === "/" ||
    isBrowseSpecialPathname(pathname) ||
    isTitleDetailPath(pathname)
  );
}

export function AppMainShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showSearchShell = usesSearchShell(pathname);
  const isTitleDetail = isTitleDetailPath(pathname);
  const isDesignPreview = pathname.startsWith("/design/");
  const [query, setQuery] = useState("");

  const handleClear = () => {
    setQuery("");
  };

  if (isDesignPreview) {
    return <main className="flex w-full flex-col">{children}</main>;
  }

  const mainClassName =
    "mx-auto flex w-full max-w-xl flex-col px-4 sm:max-w-2xl sm:px-6 lg:max-w-3xl lg:px-8 " +
    (isTitleDetail
      ? "py-4 sm:py-6 lg:py-8"
      : showSearchShell
        ? "py-10 sm:py-16 lg:py-20"
        : "py-8 sm:py-12");

  if (!showSearchShell) {
    return <main className={mainClassName}>{children}</main>;
  }

  return (
    <main className={mainClassName}>
      <SiteSearchPanel
        variant={isTitleDetail ? "detail" : "home"}
        query={query}
        onQueryChange={setQuery}
        onClear={handleClear}
      >
        {children}
      </SiteSearchPanel>
    </main>
  );
}
