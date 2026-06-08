import { BrowseJsonLd } from "@/components/browse/BrowseJsonLd";
import { HomeBrowseClient } from "@/components/browse/HomeBrowseClient";
import { HomeBrowseServerList } from "@/components/browse/HomeBrowseServerList";
import { buildBrowsePageMetadata } from "@/lib/browse/browse-page-metadata";
import { getBrowsePage } from "@/lib/browse/get-browse-page";
import {
  isBrowseUrlIndexable,
  isBrowseUrlIsrAllowed,
} from "@/lib/browse/isr-allowlist";
import { parseBrowseFiltersFromSearchParams } from "@/lib/browse/parse-search-params";
import { serializeBrowseFilters } from "@/lib/browse/filters";
import type { Metadata } from "next";

/** Next.js `searchParams` prop → URLSearchParams. */
function toUrlSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const urlParams = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string") {
      urlParams.set(key, value);
    } else if (Array.isArray(value) && value[0]) {
      urlParams.set(key, value[0]);
    }
  }

  return urlParams;
}

/** ISR: cache home page 1 HTML per allowlisted filter URL. */
export const revalidate = 3600;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const urlParams = toUrlSearchParams(resolvedSearchParams);
  const filters = parseBrowseFiltersFromSearchParams(resolvedSearchParams);
  return buildBrowsePageMetadata(filters, urlParams);
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const urlParams = toUrlSearchParams(resolvedSearchParams);
  const filters = parseBrowseFiltersFromSearchParams(resolvedSearchParams);
  const filterKey = serializeBrowseFilters(filters);
  const indexable = isBrowseUrlIndexable(filters, urlParams);

  let initialPage = null;

  if (isBrowseUrlIsrAllowed(filters, urlParams)) {
    try {
      initialPage = await getBrowsePage(1, filters);
    } catch {
      // Client will fetch on hydration if the server prefetch fails.
    }
  }

  const serverListPage =
    initialPage != null && initialPage.items.length > 0 ? initialPage : null;

  return (
    <>
      {indexable && serverListPage ? (
        <BrowseJsonLd filters={filters} items={serverListPage.items} />
      ) : null}
      {serverListPage ? (
        <HomeBrowseServerList initialPage={serverListPage} filters={filters} />
      ) : null}
      <HomeBrowseClient
        initialPage={initialPage}
        initialFilterKey={initialPage ? filterKey : null}
        hasServerList={serverListPage != null}
      />
    </>
  );
}
