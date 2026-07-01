import { Suspense } from "react";
import { BrowseJsonLd } from "@/components/browse/BrowseJsonLd";
import { HomeBrowseClient } from "@/components/browse/HomeBrowseClient";
import { HomeBrowseServerList } from "@/components/browse/HomeBrowseServerList";
import { buildBrowsePageMetadata } from "@/lib/browse/browse-page-metadata";
import { getBrowsePage } from "@/lib/browse/get-browse-page";
import {
  DEFAULT_BROWSE_FILTERS,
  serializeBrowseFilters,
} from "@/lib/browse/filters";
import type { Metadata } from "next";

/**
 * ISR: the home page is statically generated (default movies list) and cached.
 *
 * Filters live in the query string and are applied entirely on the client, so
 * the server render is independent of `searchParams`. That keeps `/` static —
 * `/` and every `/?…` filter variant are served from this one cached document
 * (canonical → `/`), instead of invoking a function per request. Indexable,
 * keyword-targeted filter pages are handled by dedicated routes.
 */
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return buildBrowsePageMetadata(DEFAULT_BROWSE_FILTERS, new URLSearchParams());
}

export default async function Home() {
  const filters = DEFAULT_BROWSE_FILTERS;
  const filterKey = serializeBrowseFilters(filters);

  let initialPage = null;

  try {
    initialPage = await getBrowsePage(1, filters);
  } catch {
    // Client will fetch on hydration if the server prefetch fails.
  }

  const serverListPage =
    initialPage != null && initialPage.items.length > 0 ? initialPage : null;

  return (
    <>
      {serverListPage ? (
        <BrowseJsonLd filters={filters} items={serverListPage.items} />
      ) : null}
      {serverListPage ? (
        <HomeBrowseServerList initialPage={serverListPage} filters={filters} />
      ) : null}
      <Suspense fallback={null}>
        <HomeBrowseClient
          initialPage={initialPage}
          initialFilterKey={initialPage ? filterKey : null}
          hasServerList={serverListPage != null}
        />
      </Suspense>
    </>
  );
}
