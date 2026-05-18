import type { Metadata } from "next";
import { TitlePageContent } from "@/components/title/TitlePageContent";
import { buildTitlePageMetadata } from "@/lib/title-page-metadata";

interface PageProps {
  params: Promise<{ id: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id, slug } = await params;
  return buildTitlePageMetadata("tv", id, slug);
}

export default async function TvTitlePage({ params }: PageProps) {
  const { id, slug } = await params;
  return <TitlePageContent mediaType="tv" idParam={id} slugParam={slug} />;
}
