"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "./SiteHeader";

export function ConditionalSiteHeader() {
  const pathname = usePathname();
  if (pathname.startsWith("/design/")) return null;
  return <SiteHeader />;
}
