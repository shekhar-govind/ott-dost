"use client";

import { useLayoutEffect } from "react";
import { useSharePayloadContext } from "@/components/share/SharePayloadProvider";
import type { SharePayload } from "@/lib/share-payload";

/** Registers title-page share data for the header ShareButton (client navigations). */
export function TitleSharePayloadSetter({ payload }: { payload: SharePayload }) {
  const { setPayload } = useSharePayloadContext();

  useLayoutEffect(() => {
    setPayload(payload);
    return () => setPayload(undefined);
  }, [payload, setPayload]);

  return null;
}
