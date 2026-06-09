import { buildBrowseCastUrl } from "@/lib/browse/person-filter-url";
import type { BrowseMediaType } from "@/lib/browse/filters";
import { PersonBrowseLink } from "@/components/title/PersonBrowseLink";
import type { CastMember } from "@/lib/tmdb/types";

interface TitleCastScrollerProps {
  cast: CastMember[];
  mediaType: BrowseMediaType;
}

export function TitleCastScroller({ cast, mediaType }: TitleCastScrollerProps) {
  if (cast.length === 0) return null;

  return (
    <ul className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {cast.map((person) => (
        <li key={person.id} className="w-[4.75rem] shrink-0 sm:w-24">
          <PersonBrowseLink
            href={buildBrowseCastUrl(mediaType, person.id)}
            personId={person.id}
            personName={person.name}
            className="group block rounded-lg outline-none transition focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
            aria-label={`Browse titles with ${person.name}`}
          >
            <CastPhoto person={person} />
            <p className="mt-2 text-xs font-medium text-zinc-900 transition group-hover:text-zinc-700">
              <span className="inline-flex w-full items-center gap-1">
                <span className="min-w-0 flex-1 truncate underline decoration-zinc-300 underline-offset-2">
                  {person.name}
                </span>
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden
                  className="h-2.5 w-2.5 shrink-0 text-zinc-400 transition group-hover:text-zinc-500"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 15 15 5" />
                  <path d="M7 5h8v8" />
                </svg>
              </span>
            </p>
            {person.character ? (
              <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-zinc-500">
                {person.character}
              </p>
            ) : null}
          </PersonBrowseLink>
        </li>
      ))}
    </ul>
  );
}

/** Standalone cast section (e.g. panel layouts). */
export function TitleCastRow({
  cast,
  mediaType,
}: TitleCastScrollerProps) {
  if (cast.length === 0) return null;

  return (
    <section className="mt-6" aria-labelledby="title-cast-heading">
      <h2
        id="title-cast-heading"
        className="text-xs font-medium uppercase tracking-wide text-zinc-500"
      >
        Cast
      </h2>
      <div className="mt-3">
        <TitleCastScroller cast={cast} mediaType={mediaType} />
      </div>
    </section>
  );
}

function CastPhoto({ person }: { person: CastMember }) {
  if (person.profileUrl) {
    return (
      <img
        src={person.profileUrl}
        alt=""
        width={96}
        height={96}
        className="aspect-square w-full rounded-lg object-cover bg-zinc-100 transition group-hover:opacity-90"
      />
    );
  }

  return (
    <div
      className="flex aspect-square w-full items-center justify-center rounded-lg bg-zinc-100 text-lg font-medium text-zinc-400 transition group-hover:bg-zinc-200"
      aria-hidden
    >
      {person.name.slice(0, 1).toUpperCase()}
    </div>
  );
}
