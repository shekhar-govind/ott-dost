import { notFound, permanentRedirect } from "next/navigation";
import { getTitleDetailCached } from "@/lib/get-title-detail-cached";
import { buildTitlePath, slugifyTitle } from "@/lib/title-url";
import type { TmdbMediaType } from "@/lib/tmdb/types";
import { TitlePeopleSection } from "./TitlePeopleSection";
import { TitleRecommendations } from "./TitleRecommendations";
import { TitleSummary } from "./TitleSummary";
import { TitleWatchCard } from "./TitleWatchCard";

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

  return (
    <>
      <TitleSummary detail={detail} variant="page" />
      <TitleWatchCard availability={detail.watchAvailability} />
      <TitlePeopleSection cast={detail.cast} crew={detail.crew} />
      <TitleRecommendations items={detail.recommendations} />
    </>
  );
}
