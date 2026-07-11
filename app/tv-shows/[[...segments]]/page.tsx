import {
  generateSpecialBrowseMetadata,
  renderSpecialBrowsePage,
  staticParamsForBrowseMediaType,
} from "@/lib/browse/special-browse-page";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ segments?: string[] }>;
}

/** Revalidate: `BROWSE_REVALIDATE_SECONDS` in `lib/cache-ttl.ts` (3d). */
export const revalidate = 259_200;
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
