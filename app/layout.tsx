import type { Metadata, Viewport } from "next";
import { type ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";
import { BrowseRestoreScript } from "@/components/browse/BrowseRestoreScript";
import { AppMainShell } from "@/components/layout/AppMainShell";
import { ConditionalSiteHeader } from "@/components/layout/ConditionalSiteHeader";
import { ConditionalSiteFooter } from "@/components/layout/ConditionalSiteFooter";
import { SharePayloadProvider } from "@/components/share/SharePayloadProvider";
import { getMetadataBaseUrl } from "@/lib/site-url";
import "./globals.css";

const metadataBase = new URL(getMetadataBaseUrl());

export const metadata: Metadata = {
  metadataBase,
  title: "OTT Dost",
  description: "Find where to watch movies and shows in India",
  verification: {
    google: "4xk7uq6rQCaTrYDvDlqAmBvNGZBAIdffgBKoc5OuNPo",
  },
  icons: {
    icon: [{ url: "/ott-dost-logo.png", type: "image/png" }],
    apple: [{ url: "/ott-dost-logo.png", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="flex flex-col bg-zinc-50 text-zinc-900 antialiased">
        <BrowseRestoreScript />
        <SharePayloadProvider>
          <ConditionalSiteHeader />
          <AppMainShell>{children}</AppMainShell>
          <ConditionalSiteFooter />
        </SharePayloadProvider>
        <Analytics />
      </body>
    </html>
  );
}
