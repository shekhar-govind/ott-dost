import type { ReactNode } from "react";

/** Design previews use the full viewport without the global site header. */
export default function DesignLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
