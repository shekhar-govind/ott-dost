import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AppMainShell } from "@/components/layout/AppMainShell";
import { SiteHeader } from "@/components/layout/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "OTT Dost",
  description: "Find where to watch movies and shows in India",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col bg-zinc-50 text-zinc-900 antialiased">
        <SiteHeader />
        <AppMainShell>{children}</AppMainShell>
      </body>
    </html>
  );
}
