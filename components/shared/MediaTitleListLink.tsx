"use client";

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

const browseLinkClass = cn(
  "relative flex w-full min-h-14 touch-manipulation items-start gap-2.5 rounded-lg border border-zinc-100 bg-white px-2.5 py-2 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline-none transition-[border-color,background-color,box-shadow,opacity,transform] duration-200 ease-out",
  "hover:border-zinc-200/90 hover:bg-zinc-50/70 active:bg-zinc-50 active:scale-[0.992] motion-reduce:transition-none motion-reduce:active:scale-100",
  "focus-visible:ring-2 focus-visible:ring-zinc-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50",
  "sm:min-h-0 sm:gap-3 sm:px-3 sm:py-2.5",
  "[&:has([data-nav-pending])]:border-violet-200/90 [&:has([data-nav-pending])]:bg-gradient-to-br [&:has([data-nav-pending])]:from-violet-50/90 [&:has([data-nav-pending])]:to-white",
  "[&:has([data-nav-pending])]:shadow-[0_2px_14px_rgba(109,40,217,0.09)]",
);

const searchLinkClass = cn(
  "relative flex w-full min-h-14 touch-manipulation items-start gap-3 px-3 py-3 text-left outline-none transition-[background-color,opacity,transform] duration-200 ease-out",
  "active:bg-zinc-100 active:scale-[0.992] motion-reduce:transition-none motion-reduce:active:scale-100",
  "focus-visible:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-zinc-300",
  "sm:min-h-0 sm:py-2.5",
  "[&:has([data-nav-pending])]:bg-violet-50/80 [&:has([data-nav-pending])]:shadow-[inset_0_0_0_1px_rgba(139,92,246,0.12)]",
);

interface MediaTitleListLinkProps {
  item: SearchTitle;
  variant: MediaTitleListLinkVariant;
  streamProviders?: StreamingProvider[];
  streamLoadState?: BrowseStreamLoadState;
  streamIsLoading?: boolean;
  onRetryStreamProviders?: () => void;
  /** Search row: keyboard/highlight state */
  isActive?: boolean;
  onMouseEnter?: MouseEventHandler<HTMLAnchorElement>;
  onTouchStart?: TouchEventHandler<HTMLAnchorElement>;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

function LinkRowSurface({
  item,
  variant,
  streamProviders,
  streamLoadState,
  streamIsLoading,
  onRetryStreamProviders,
}: {
  item: SearchTitle;
  variant: MediaTitleListLinkVariant;
  streamProviders?: StreamingProvider[];
  streamLoadState?: BrowseStreamLoadState;
  streamIsLoading?: boolean;
  onRetryStreamProviders?: () => void;
}) {
  const { pending } = useLinkStatus();

  return (
    <span
      className={cn(
        "relative z-[1] flex w-full min-w-0 items-start",
        variant === "browse" ? "gap-2.5 sm:gap-3" : "gap-3",
      )}
      {...(pending ? { "data-nav-pending": "" } : {})}
      aria-busy={pending}
    >
      {pending ? (
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
        streamLoadState={streamLoadState}
        streamIsLoading={streamIsLoading}
        onRetryStreamProviders={onRetryStreamProviders}
      />
    </span>
  );
}

export function MediaTitleListLink({
  item,
  variant,
  streamProviders,
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
    variant === "browse" ? browseLinkClass : searchLinkClass,
    variant === "search" &&
      (isActive ? "bg-zinc-100 hover:bg-zinc-100" : "hover:bg-zinc-50"),
  );

  return (
    <Link
      href={href}
      prefetch
      className={linkClass}
      onMouseEnter={onMouseEnter}
      onTouchStart={onTouchStart}
      onClick={onClick}
    >
      <LinkRowSurface
        item={item}
        variant={variant}
        streamProviders={streamProviders}
        streamLoadState={streamLoadState}
        streamIsLoading={streamIsLoading}
        onRetryStreamProviders={onRetryStreamProviders}
      />
    </Link>
  );
}
