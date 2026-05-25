"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { SharePayload } from "@/lib/share-payload";

const TITLE_SHARE_SCRIPT_ID = "ott-dost-title-share";

export function usePageSharePayload(
  explicit?: SharePayload,
): SharePayload | undefined {
  const pathname = usePathname();
  const [fromPage, setFromPage] = useState<SharePayload | undefined>();

  useEffect(() => {
    const el = document.getElementById(TITLE_SHARE_SCRIPT_ID);
    if (!el?.textContent?.trim()) {
      setFromPage(undefined);
      return;
    }

    try {
      setFromPage(JSON.parse(el.textContent) as SharePayload);
    } catch {
      setFromPage(undefined);
    }
  }, [pathname]);

  return explicit ?? fromPage;
}
