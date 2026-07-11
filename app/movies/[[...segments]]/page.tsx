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
  return staticParamsForBrowseMediaType("movie");
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  return generateSpecialBrowseMetadata("movie", props);
}

export default async function MoviesBrowsePage(props: PageProps) {
  return renderSpecialBrowsePage("movie", props);
}
