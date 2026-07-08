import {
  generateSpecialBrowseMetadata,
  renderSpecialBrowsePage,
  staticParamsForBrowseMediaType,
} from "@/lib/browse/special-browse-page";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ segments?: string[] }>;
}

/** Revalidate: `BROWSE_REVALIDATE_SECONDS` in `lib/cache-ttl.ts` (12h). */
export const revalidate = 43_200;
export const dynamicParams = false;

export function generateStaticParams() {
  return staticParamsForBrowseMediaType("tv");
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  return generateSpecialBrowseMetadata("tv", props);
}

export default async function TvShowsBrowsePage(props: PageProps) {
  return renderSpecialBrowsePage("tv", props);
}
