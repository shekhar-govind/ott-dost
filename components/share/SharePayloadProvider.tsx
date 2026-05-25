"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { SharePayload } from "@/lib/share-payload";

type SharePayloadContextValue = {
  payload: SharePayload | undefined;
  setPayload: (payload: SharePayload | undefined) => void;
};

export const SharePayloadContext =
  createContext<SharePayloadContextValue | null>(null);

export function SharePayloadProvider({ children }: { children: ReactNode }) {
  const [payload, setPayloadState] = useState<SharePayload | undefined>();
  const setPayload = useCallback((next: SharePayload | undefined) => {
    setPayloadState(next);
  }, []);

  const value = useMemo(
    () => ({ payload, setPayload }),
    [payload, setPayload],
  );

  return (
    <SharePayloadContext.Provider value={value}>
      {children}
    </SharePayloadContext.Provider>
  );
}

export function useSharePayloadContext(): SharePayloadContextValue {
  const ctx = useContext(SharePayloadContext);
  if (!ctx) {
    throw new Error("useSharePayloadContext must be used within SharePayloadProvider");
  }
  return ctx;
}
