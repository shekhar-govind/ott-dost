import type { Metadata, Viewport } from "next";
import { type ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";
import {
  BROWSE_RESTORE_HEAD_CSS,
  getBrowseRestoreHeadScript,
} from "@/lib/browse/browse-restore-head";
import { AppMainShell } from "@/components/layout/AppMainShell";
import { ConditionalSiteHeader } from "@/components/layout/ConditionalSiteHeader";
import { ConditionalSiteFooter } from "@/components/layout/ConditionalSiteFooter";
import { SharePayloadProvider } from "@/components/share/SharePayloadProvider";
import { ServiceWorkerRegistrar } from "@/components/pwa/ServiceWorkerRegistrar";
import { ChunkErrorReloader } from "@/components/system/ChunkErrorReloader";
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
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-icon-180.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "OTT Dost",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light",
  themeColor: "#fafafa",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: BROWSE_RESTORE_HEAD_CSS }} />
        <script dangerouslySetInnerHTML={{ __html: getBrowseRestoreHeadScript() }} />
      </head>
      <body className="flex flex-col bg-zinc-50 text-zinc-900 antialiased">
        <SharePayloadProvider>
          <ConditionalSiteHeader />
          <AppMainShell>{children}</AppMainShell>
          <ConditionalSiteFooter />
        </SharePayloadProvider>
        <ChunkErrorReloader />
        <ServiceWorkerRegistrar />
        <Analytics />
      </body>
    </html>
  );
}
