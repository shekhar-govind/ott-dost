"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "./SiteFooter";

export function ConditionalSiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/design/")) return null;
  return <SiteFooter />;
}
