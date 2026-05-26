import type { CastMember, CrewCredit } from "@/lib/tmdb/types";
import type { BrowseMediaType } from "@/lib/browse/filters";
import { TitleCastScroller } from "./TitleCastRow";
import { TitleCrewCollapsible } from "./TitleCrewList";

interface TitlePeopleSectionProps {
  cast: CastMember[];
  crew: CrewCredit[];
  mediaType: BrowseMediaType;
}

export function TitlePeopleSection({
  cast,
  crew,
  mediaType,
}: TitlePeopleSectionProps) {
  if (cast.length === 0 && crew.length === 0) return null;

  return (
    <article className="mt-3 rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="p-4 sm:p-6">
        <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Cast & crew
        </h2>

        {cast.length > 0 ? (
          <div className="mt-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
              Cast
            </p>
            <div className="mt-2">
              <TitleCastScroller cast={cast} mediaType={mediaType} />
            </div>
          </div>
        ) : null}

        {crew.length > 0 ? (
          <TitleCrewCollapsible
            crew={crew}
            mediaType={mediaType}
            className={cast.length > 0 ? "mt-4 border-t border-zinc-100 pt-4" : "mt-4"}
          />
        ) : null}
      </div>
    </article>
  );
}
