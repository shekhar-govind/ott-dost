"use client";

import { useBrowseStreamProvidersContext } from "@/components/browse/BrowseStreamProvidersContext";
import { MediaTitleListLink } from "@/components/shared/MediaTitleListLink";
import { browseItemKey } from "@/lib/browse/items";
import type { SearchTitle } from "@/lib/tmdb/types";

interface BrowseListItemProps {
  item: SearchTitle;
}

export function BrowseListItem({ item }: BrowseListItemProps) {
  const { providers, loadState, isStreamLoading, retryStreamProviders, setItemRef } =
    useBrowseStreamProvidersContext(item);

  return (
    <li
      ref={setItemRef}
      data-browse-key={browseItemKey(item)}
      className="scroll-mt-4"
    >
      <MediaTitleListLink
        variant="browse"
        item={item}
        streamProviders={providers}
        streamLoadState={loadState}
        streamIsLoading={isStreamLoading}
        onRetryStreamProviders={() => retryStreamProviders(item)}
      />
    </li>
  );
}
