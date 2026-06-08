"use client";

import { BROWSE_ITEM_LINK_CLASS } from "@/lib/browse/browse-item-link-class";
import { ListItemPoster } from "@/components/shared/ListItemPoster";
import { MediaListItemBody } from "@/components/shared/MediaListItemBody";
import { titlePathFromSearchTitle } from "@/lib/title-url";
import type { BrowseStreamLoadState } from "@/hooks/useBrowseStreamProviders";
import type { SearchTitle, StreamingProvider } from "@/lib/tmdb/types";
import Link from "next/link";
import { useLinkStatus } from "next/link";
import type { MouseEventHandler, TouchEventHandler } from "react";

export type MediaTitleListLinkVariant = "browse" | "search";

function cn(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

const searchLinkClass = cn(
  "relative flex w-full min-h-14 touch-manipulation items-start gap-3 px-3 py-3 text-left outline-none transition-[background-color,opacity,transform] duration-200 ease-out",
  "active:bg-zinc-100 active:scale-[0.992] motion-reduce:transition-none motion-reduce:active:scale-100",
  "focus-visible:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-zinc-300",
  "sm:min-h-0 sm:py-2.5",
  "[&:has([data-nav-pending])]:bg-violet-50/80 [&:has([data-nav-pending])]:shadow-[inset_0_0_0_1px_rgba(139,92,246,0.12)]",
);

interface RowSurfaceProps {
  item: SearchTitle;
  variant: MediaTitleListLinkVariant;
  streamProviders?: StreamingProvider[];
  streamHasRentOrBuy?: boolean;
  streamLoadState?: BrowseStreamLoadState;
  streamIsLoading?: boolean;
  onRetryStreamProviders?: () => void;
  isPending?: boolean;
}

function ListRowSurface({
  item,
  variant,
  streamProviders,
  streamHasRentOrBuy,
  streamLoadState,
  streamIsLoading,
  onRetryStreamProviders,
  isPending = false,
}: RowSurfaceProps) {
  return (
    <span
      className={cn(
        "relative z-[1] flex w-full min-w-0 items-start",
        variant === "browse" ? "gap-2.5 sm:gap-3" : "gap-3",
      )}
      {...(isPending ? { "data-nav-pending": "" } : {})}
      aria-busy={isPending}
    >
      {isPending ? (
        <span
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] motion-reduce:hidden"
          aria-hidden
        >
          <span className="browse-row-shimmer absolute inset-y-0 w-[55%] -translate-x-full bg-gradient-to-r from-transparent via-white/75 to-transparent opacity-95" />
        </span>
      ) : null}

      <span
        className={cn(
          "relative z-[1] shrink-0",
          variant === "browse" ? "pt-px sm:pt-0.5" : "pt-0.5 sm:pt-0",
        )}
      >
        <ListItemPoster posterUrl={item.posterUrl} title={item.title} />
      </span>
      <MediaListItemBody
        item={item}
        variant={variant === "browse" ? "browse" : "default"}
        streamProviders={streamProviders}
        streamHasRentOrBuy={streamHasRentOrBuy}
        streamLoadState={streamLoadState}
        streamIsLoading={streamIsLoading}
        onRetryStreamProviders={onRetryStreamProviders}
      />
    </span>
  );
}

function LinkedRowSurface(props: RowSurfaceProps & { showNavPending: boolean }) {
  const { pending } = useLinkStatus();
  const isPending = props.showNavPending && pending;
  return <ListRowSurface {...props} isPending={isPending} />;
}

interface MediaTitleListLinkProps {
  item: SearchTitle;
  variant: MediaTitleListLinkVariant;
  /** Home browse rows open in a new tab so the list tab stays put. */
  openInNewTab?: boolean;
  streamProviders?: StreamingProvider[];
  streamHasRentOrBuy?: boolean;
  streamLoadState?: BrowseStreamLoadState;
  streamIsLoading?: boolean;
  onRetryStreamProviders?: () => void;
  /** Search row: keyboard/highlight state */
  isActive?: boolean;
  onMouseEnter?: MouseEventHandler<HTMLElement>;
  onTouchStart?: TouchEventHandler<HTMLElement>;
  onClick?: MouseEventHandler<HTMLElement>;
}

export function MediaTitleListLink({
  item,
  variant,
  openInNewTab = false,
  streamProviders,
  streamHasRentOrBuy,
  streamLoadState,
  streamIsLoading,
  onRetryStreamProviders,
  isActive = false,
  onMouseEnter,
  onTouchStart,
  onClick,
}: MediaTitleListLinkProps) {
  const href = titlePathFromSearchTitle(item);

  const linkClass = cn(
    variant === "browse" ? BROWSE_ITEM_LINK_CLASS : searchLinkClass,
    variant === "search" &&
      (isActive ? "bg-zinc-100 hover:bg-zinc-100" : "hover:bg-zinc-50"),
  );

  const rowProps: RowSurfaceProps = {
    item,
    variant,
    streamProviders,
    streamHasRentOrBuy,
    streamLoadState,
    streamIsLoading,
    onRetryStreamProviders,
  };

  if (variant === "search" && onClick) {
    return (
      <button
        type="button"
        className={linkClass}
        onMouseEnter={onMouseEnter}
        onTouchStart={onTouchStart}
        onClick={onClick}
      >
        <ListRowSurface {...rowProps} />
      </button>
    );
  }

  return (
    <Link
      href={href}
      prefetch={!openInNewTab}
      target={openInNewTab ? "_blank" : undefined}
      rel={openInNewTab ? "noopener noreferrer" : undefined}
      className={linkClass}
      onMouseEnter={onMouseEnter}
      onTouchStart={onTouchStart}
      onClick={onClick}
    >
      <LinkedRowSurface
        {...rowProps}
        showNavPending={!openInNewTab}
      />
    </Link>
  );
}
