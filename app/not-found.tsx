import { TitleNotFound } from "@/components/title/TitleNotFound";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Not found | OTT Dost",
};

export default function NotFound() {
  return <TitleNotFound />;
}
