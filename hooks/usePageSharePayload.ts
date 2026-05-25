"use client";

import { useContext } from "react";
import { SharePayloadContext } from "@/components/share/SharePayloadProvider";
import type { SharePayload } from "@/lib/share-payload";

export function usePageSharePayload(
  explicit?: SharePayload,
): SharePayload | undefined {
  const ctx = useContext(SharePayloadContext);
  return explicit ?? ctx?.payload;
}
