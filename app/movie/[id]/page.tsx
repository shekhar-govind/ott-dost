import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getTitleDetailCached } from "@/lib/get-title-detail-cached";
import { buildTitlePath } from "@/lib/title-url";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "OTT Dost",
};

export default async function MovieIdRedirectPage({ params }: PageProps) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    notFound();
  }

  const detail = await getTitleDetailCached("movie", numericId);
  if (!detail) {
    notFound();
  }

  permanentRedirect(buildTitlePath("movie", numericId, detail.title));
}
