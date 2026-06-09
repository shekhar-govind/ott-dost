import type { ReactNode } from "react";

/** Remount title page content on client navigations so interactive islands hydrate cleanly. */
export default function MovieTitleTemplate({ children }: { children: ReactNode }) {
  return children;
}
