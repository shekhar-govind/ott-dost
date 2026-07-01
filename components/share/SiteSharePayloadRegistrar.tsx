"use client";

import { useSharePayloadContext } from "@/components/share/SharePayloadProvider";
import { useBrowseFilterMeta } from "@/hooks/useBrowseFilterMeta";
import { useBrowsePersonFilterNames } from "@/hooks/useBrowsePersonFilterNames";
import {
  appendSiteShareUrl,
  buildSiteSharePayload,
  resolveBrowseFiltersForShare,
  resolveProviderNameForFilters,
} from "@/lib/build-site-share-payload";
import { DEFAULT_BROWSE_FILTERS } from "@/lib/browse/filters";
import { isBrowseSpecialPathname } from "@/lib/browse/is-browse-special-path";
import { isTitleRoutePath } from "@/lib/title-detail-path";
import { usePathname, useSearchParams } from "next/navigation";
import { useLayoutEffect, useMemo } from "react";

function resolveShareUrl(pathname: string, searchParams: URLSearchParams): string {
  const query = searchParams.toString();
  const path = query ? `${pathname}?${query}` : pathname;
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}

export function SiteSharePayloadRegistrar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setPayload } = useSharePayloadContext();

  const isBrowseRoute =
    pathname === "/" || isBrowseSpecialPathname(pathname);
  const filters = useMemo(
    () => resolveBrowseFiltersForShare(pathname, searchParams),
    [pathname, searchParams],
  );

  const { meta } = useBrowseFilterMeta(isBrowseRoute);
  const personLabels = useBrowsePersonFilterNames(filters ?? DEFAULT_BROWSE_FILTERS);

  const payload = useMemo(() => {
    if (isTitleRoutePath(pathname)) {
      return undefined;
    }

    const personName =
      personLabels.cast?.status === "ready"
        ? personLabels.cast.label
        : personLabels.crew?.status === "ready"
          ? personLabels.crew.label
          : null;

    const providerOptions =
      filters?.mediaType === "tv" ? meta.tvProviders : meta.movieProviders;

    const providerName = filters
      ? resolveProviderNameForFilters(filters, providerOptions)
      : undefined;

    const base = buildSiteSharePayload(pathname, searchParams, {
      personName,
      providerName,
    });

    if (!base) return undefined;

    return appendSiteShareUrl(base, resolveShareUrl(pathname, searchParams));
  }, [pathname, searchParams, filters, personLabels, meta.movieProviders, meta.tvProviders]);

  useLayoutEffect(() => {
    if (isTitleRoutePath(pathname)) {
      return;
    }

    setPayload(payload);
    return () => setPayload(undefined);
  }, [pathname, payload, setPayload]);

  return null;
}
