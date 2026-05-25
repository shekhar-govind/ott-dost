import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";
import { AppMainShell } from "@/components/layout/AppMainShell";
import { ConditionalSiteHeader } from "@/components/layout/ConditionalSiteHeader";
import { ConditionalSiteFooter } from "@/components/layout/ConditionalSiteFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: "OTT Dost",
  description: "Find where to watch movies and shows in India",
  icons: {
    icon: [{ url: "/ott-dost-logo.png", type: "image/png" }],
    apple: [{ url: "/ott-dost-logo.png", type: "image/png" }],
  },
  // Beta: remove or relax when the site should be publicly indexable.
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
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
        <ConditionalSiteHeader />
        <AppMainShell>{children}</AppMainShell>
        <ConditionalSiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
