import { buildBrowseCrewUrl } from "@/lib/browse/person-filter-url";
import type { BrowseMediaType } from "@/lib/browse/filters";
import type { CrewCredit, CrewCreditMember } from "@/lib/tmdb/types";
import { Fragment } from "react";
import { PersonBrowseLink } from "./PersonBrowseLink";

interface TitleCrewCollapsibleProps {
  crew: CrewCredit[];
  mediaType: BrowseMediaType;
  className?: string;
}

export function TitleCrewCollapsible({
  crew,
  mediaType,
  className = "",
}: TitleCrewCollapsibleProps) {
  if (crew.length === 0) return null;

  return (
    <details className={`group ${className}`.trim()}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-medium text-zinc-700 [&::-webkit-details-marker]:hidden">
        <span>Crew ({crew.length})</span>
        <span
          className="text-zinc-400 transition-transform group-open:rotate-180"
          aria-hidden
        >
          ▾
        </span>
      </summary>
      <dl className="mt-3 space-y-2.5">
        {crew.map((credit) => (
          <div key={credit.job} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
            <dt className="shrink-0 text-xs font-medium text-zinc-700 sm:w-36">
              {credit.job}
            </dt>
            <dd className="min-w-0 text-pretty text-sm text-zinc-600">
              <CrewMemberLinks members={credit.members} mediaType={mediaType} />
              {credit.extraCount ? (
                <span className="text-zinc-400">{` +${credit.extraCount} more`}</span>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
    </details>
  );
}

/** Standalone crew section with heading always visible. */
export function TitleCrewList({
  crew,
  mediaType,
}: TitleCrewCollapsibleProps) {
  if (crew.length === 0) return null;

  return (
    <section className="mt-6" aria-labelledby="title-crew-heading">
      <h2
        id="title-crew-heading"
        className="text-xs font-medium uppercase tracking-wide text-zinc-500"
      >
        Crew
      </h2>
      <TitleCrewCollapsible crew={crew} mediaType={mediaType} className="mt-3" />
    </section>
  );
}

function CrewMemberLinks({
  members,
  mediaType,
}: {
  members: CrewCreditMember[];
  mediaType: BrowseMediaType;
}) {
  return (
    <>
      {members.map((member, index) => (
        <Fragment key={member.id}>
          {index > 0 ? ", " : null}
          <PersonBrowseLink
            href={buildBrowseCrewUrl(mediaType, member.id)}
            personId={member.id}
            personName={member.name}
            className="text-zinc-600 underline-offset-2 transition hover:text-zinc-900 hover:underline"
          >
            {member.name}
          </PersonBrowseLink>
        </Fragment>
      ))}
    </>
  );
}
