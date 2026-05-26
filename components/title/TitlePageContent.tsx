import { notFound, permanentRedirect } from "next/navigation";
import { getTitleDetailCached } from "@/lib/get-title-detail-cached";
import { buildTitlePath, slugifyTitle } from "@/lib/title-url";
import type { TmdbMediaType } from "@/lib/tmdb/types";
import { TitleBackHomeLink } from "./TitleBackHomeLink";
import { buildTitleSharePayload } from "@/lib/build-title-share-payload";
import { TitleSharePayloadSetter } from "@/components/share/TitleSharePayloadSetter";
import { TitlePeopleSection } from "./TitlePeopleSection";
import { TitleRecommendations } from "./TitleRecommendations";
import { TitleSummary } from "./TitleSummary";
import { TitleTrailer } from "./TitleTrailer";
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

  const sharePayload = buildTitleSharePayload(detail);

  return (
    <>
      <TitleSharePayloadSetter payload={sharePayload} />
      <div className="mt-3 space-y-3">
        <TitleBackHomeLink />
        <TitleSummary detail={detail} variant="page" />
      </div>
      {detail.trailer ? <TitleTrailer trailer={detail.trailer} /> : null}
      <TitleWatchCard availability={detail.watchAvailability} />
      <TitlePeopleSection
        cast={detail.cast}
        crew={detail.crew}
        mediaType={mediaType}
      />
      <TitleRecommendations items={detail.recommendations} />
    </>
  );
}
