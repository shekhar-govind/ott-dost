import { Suspense } from "react";
import { notFound } from "next/navigation";
import { BrowseJsonLd } from "@/components/browse/BrowseJsonLd";
import { HomeBrowseServerList } from "@/components/browse/HomeBrowseServerList";
import { SpecialBrowseClient } from "@/components/browse/SpecialBrowseClient";
import { getBrowsePage } from "@/lib/browse/get-browse-page";
import type { BrowseMediaType } from "@/lib/browse/filters";
import { serializeBrowseFilters } from "@/lib/browse/filters";
import {
  browseFiltersFromSpecialPath,
  parseBrowseSpecialPath,
} from "@/lib/browse/path-facets";
import {
  buildSpecialBrowseListTitle,
  buildSpecialBrowsePageMetadata,
} from "@/lib/browse/special-page-metadata";
import { listLaunchBrowseSpecialPagePaths } from "@/lib/browse/special-pages-allowlist";
import { browseNamespaceFromMediaType } from "@/lib/browse/slug-registry";
import type { Metadata } from "next";

function pathnameFromSegments(
  mediaType: BrowseMediaType,
  segments: string[],
): string {
  const namespace = browseNamespaceFromMediaType(mediaType);
  if (segments.length === 0) return `/${namespace}`;
  return `/${namespace}/${segments.join("/")}`;
}

export function staticParamsForBrowseMediaType(mediaType: BrowseMediaType) {
  return listLaunchBrowseSpecialPagePaths()
    .filter((entry) => entry.mediaType === mediaType)
    .map((entry) => ({
      segments: entry.segments.length > 0 ? entry.segments : [],
    }));
}

interface SpecialBrowsePageProps {
  params: Promise<{ segments?: string[] }>;
}

async function resolveSpecialBrowsePage(mediaType: BrowseMediaType, props: SpecialBrowsePageProps) {
  const { segments: rawSegments } = await props.params;
  const segments = rawSegments ?? [];
  const pathname = pathnameFromSegments(mediaType, segments);
  const parsed = parseBrowseSpecialPath(pathname);

  if (!parsed || parsed.mediaType !== mediaType) {
    notFound();
  }

  const filters = browseFiltersFromSpecialPath(parsed);
  const filterKey = serializeBrowseFilters(filters);

  let initialPage = null;
  try {
    initialPage = await getBrowsePage(1, filters);
  } catch {
    // Client fetches on hydration if prefetch fails.
  }

  const serverListPage =
    initialPage != null && initialPage.items.length > 0 ? initialPage : null;
  const listTitle = buildSpecialBrowseListTitle(filters, pathname);

  return {
    pathname,
    filters,
    filterKey,
    initialPage,
    serverListPage,
    listTitle,
  };
}

export async function generateSpecialBrowseMetadata(
  mediaType: BrowseMediaType,
  props: SpecialBrowsePageProps,
): Promise<Metadata> {
  const { pathname, filters } = await resolveSpecialBrowsePage(mediaType, props);
  return buildSpecialBrowsePageMetadata(
    pathname,
    new URLSearchParams(),
    filters,
  );
}

export async function renderSpecialBrowsePage(
  mediaType: BrowseMediaType,
  props: SpecialBrowsePageProps,
) {
  const {
    pathname,
    filters,
    filterKey,
    initialPage,
    serverListPage,
    listTitle,
  } = await resolveSpecialBrowsePage(mediaType, props);

  return (
    <>
      {serverListPage ? (
        <BrowseJsonLd filters={filters} items={serverListPage.items} />
      ) : null}
      {serverListPage ? (
        <HomeBrowseServerList
          initialPage={serverListPage}
          filters={filters}
          listTitle={listTitle}
        />
      ) : null}
      <Suspense fallback={null}>
        <SpecialBrowseClient
          pathname={pathname}
          initialPage={initialPage}
          initialFilterKey={initialPage ? filterKey : null}
          hasServerList={serverListPage != null}
        />
      </Suspense>
    </>
  );
}
