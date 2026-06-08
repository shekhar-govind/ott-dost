import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/** Design previews use the full viewport without the global site header. */
export default function DesignLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
