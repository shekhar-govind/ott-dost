import type { Metadata } from "next";
import { TitlePageContent } from "@/components/title/TitlePageContent";
import { buildTitlePageMetadata } from "@/lib/title-page-metadata";

interface PageProps {
  params: Promise<{ id: string; slug: string }>;
}

// Cache rendered title pages as ISR (generated on demand, revalidated weekly)
// so crawler traffic is served from cache instead of invoking a function per
// hit. Matches `TITLE_REVALIDATE_SECONDS` in `lib/cache-ttl.ts` (7d).
export const revalidate = 604_800;
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
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
