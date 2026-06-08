import { TitleNotFound } from "@/components/title/TitleNotFound";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Not found | OTT Dost",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return <TitleNotFound />;
}
