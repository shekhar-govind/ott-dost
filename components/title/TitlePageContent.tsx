import { notFound, permanentRedirect } from "next/navigation";
import { getTitleDetailCached } from "@/lib/get-title-detail-cached";
import { buildTitlePath, slugifyTitle } from "@/lib/title-url";
import type { TmdbMediaType } from "@/lib/tmdb/types";
import { TitleSummary } from "./TitleSummary";

interface TitlePageContentProps {
  mediaType: TmdbMediaType;
  idParam: string;
  slugParam: string;
}

export async function TitlePageContent({
  mediaType,
  idParam,
  slugParam,
}: TitlePageContentProps) {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) {
    notFound();
  }

  const detail = await getTitleDetailCached(mediaType, id);
  if (!detail) {
    notFound();
  }

  const canonicalSlug = slugifyTitle(detail.title);
  if (slugParam !== canonicalSlug) {
    permanentRedirect(buildTitlePath(mediaType, id, detail.title));
  }

  return <TitleSummary detail={detail} variant="page" />;
}
