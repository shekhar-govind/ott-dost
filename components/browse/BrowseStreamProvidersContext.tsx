"use client";

import {
  useBrowseStreamProviders,
  type BrowseStreamLoadState,
} from "@/hooks/useBrowseStreamProviders";
import { browseItemKey } from "@/lib/browse/items";
import type { SearchTitle, StreamingProvider } from "@/lib/tmdb/types";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

interface BrowseStreamProvidersContextValue {
  registerItemElement: (key: string, element: HTMLElement | null) => void;
  getProviders: (key: string) => StreamingProvider[] | undefined;
  getLoadState: (key: string) => BrowseStreamLoadState;
  isStreamLoading: (key: string) => boolean;
  retryStreamProviders: (item: Pick<SearchTitle, "id" | "mediaType">) => void;
}

const BrowseStreamProvidersContext =
  createContext<BrowseStreamProvidersContextValue | null>(null);

interface BrowseStreamProvidersProviderProps {
  enabled: boolean;
  items: SearchTitle[];
  filterCacheKey: string;
  children: ReactNode;
}

export function BrowseStreamProvidersProvider({
  enabled,
  items,
  filterCacheKey,
  children,
}: BrowseStreamProvidersProviderProps) {
  const {
    getProviders,
    getLoadState,
    isStreamLoading,
    retryStreamProviders,
    registerItemElement,
  } = useBrowseStreamProviders({
    enabled,
    items,
    filterCacheKey,
  });

  const value = useMemo(
    () => ({
      registerItemElement,
      getProviders,
      getLoadState,
      isStreamLoading,
      retryStreamProviders,
    }),
    [
      registerItemElement,
      getProviders,
      getLoadState,
      isStreamLoading,
      retryStreamProviders,
    ],
  );

  return (
    <BrowseStreamProvidersContext.Provider value={value}>
      {children}
    </BrowseStreamProvidersContext.Provider>
  );
}

export function useBrowseStreamProvidersContext(
  item: Pick<SearchTitle, "id" | "mediaType">,
): {
  providers: StreamingProvider[] | undefined;
  loadState: BrowseStreamLoadState;
  isStreamLoading: boolean;
  retryStreamProviders: (item: Pick<SearchTitle, "id" | "mediaType">) => void;
  setItemRef: (element: HTMLElement | null) => void;
} {
  const context = useContext(BrowseStreamProvidersContext);
  const key = browseItemKey(item);

  const setItemRef = useCallback(
    (element: HTMLElement | null) => {
      context?.registerItemElement(key, element);
    },
    [context, key],
  );

  if (!context) {
    return {
      providers: undefined,
      loadState: "pending",
      isStreamLoading: false,
      retryStreamProviders: () => {},
      setItemRef: () => {},
    };
  }

  return {
    providers: context.getProviders(key),
    loadState: context.getLoadState(key),
    isStreamLoading: context.isStreamLoading(key),
    retryStreamProviders: () => context.retryStreamProviders(item),
    setItemRef,
  };
}
