import {
  generateSpecialBrowseMetadata,
  renderSpecialBrowsePage,
  staticParamsForBrowseMediaType,
} from "@/lib/browse/special-browse-page";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ segments?: string[] }>;
}

export const revalidate = 3600;
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
