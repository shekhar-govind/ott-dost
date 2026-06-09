"use client";

import {
  stabilizeMobileViewport,
  shouldStabilizeViewport,
} from "@/lib/mobile-viewport-stabilize";
import Link, { type LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import type { ComponentProps, MouseEventHandler } from "react";

type StableClientLinkProps = ComponentProps<typeof Link>;

function hrefToPath(href: LinkProps["href"]): string {
  if (typeof href === "string") return href;
  const pathname = href.pathname ?? "";
  const query = href.query;
  if (!query) return pathname;
  if (typeof query === "string") {
    return query.startsWith("?") ? `${pathname}${query}` : `${pathname}?${query}`;
  }
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value != null) params.set(key, String(value));
  }
  const search = params.toString();
  return search ? `${pathname}?${search}` : pathname;
}

/** Client link that stabilizes mobile viewport before same-tab navigation. */
export function StableClientLink({
  href,
  onClick,
  ...props
}: StableClientLinkProps) {
  const router = useRouter();

  const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (!shouldStabilizeViewport()) return;

    event.preventDefault();
    void (async () => {
      await stabilizeMobileViewport();
      router.push(hrefToPath(href) as Route);
    })();
  };

  return <Link href={href} onClick={handleClick} {...props} />;
}
