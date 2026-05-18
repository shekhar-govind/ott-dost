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
  return buildTitlePageMetadata("movie", id, slug);
}

export default async function MovieTitlePage({ params }: PageProps) {
  const { id, slug } = await params;
  return (
    <TitlePageContent mediaType="movie" idParam={id} slugParam={slug} />
  );
}
