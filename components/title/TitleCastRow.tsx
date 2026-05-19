import type { CastMember } from "@/lib/tmdb/types";

interface TitleCastScrollerProps {
  cast: CastMember[];
}

export function TitleCastScroller({ cast }: TitleCastScrollerProps) {
  if (cast.length === 0) return null;

  return (
    <ul className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {cast.map((person) => (
        <li key={person.id} className="w-[4.75rem] shrink-0 sm:w-24">
          <CastPhoto person={person} />
          <p className="mt-2 truncate text-xs font-medium text-zinc-900">
            {person.name}
          </p>
          {person.character ? (
            <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-zinc-500">
              {person.character}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

/** Standalone cast section (e.g. panel layouts). */
export function TitleCastRow({ cast }: TitleCastScrollerProps) {
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
        <TitleCastScroller cast={cast} />
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
        className="aspect-square w-full rounded-lg object-cover bg-zinc-100"
      />
    );
  }

  return (
    <div
      className="flex aspect-square w-full items-center justify-center rounded-lg bg-zinc-100 text-lg font-medium text-zinc-400"
      aria-hidden
    >
      {person.name.slice(0, 1).toUpperCase()}
    </div>
  );
}
