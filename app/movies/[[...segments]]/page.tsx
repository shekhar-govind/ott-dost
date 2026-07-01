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
  return staticParamsForBrowseMediaType("movie");
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  return generateSpecialBrowseMetadata("movie", props);
}

export default async function MoviesBrowsePage(props: PageProps) {
  return renderSpecialBrowsePage("movie", props);
}
