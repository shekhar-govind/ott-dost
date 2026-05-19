import type { CrewCredit } from "@/lib/tmdb/types";

interface TitleCrewCollapsibleProps {
  crew: CrewCredit[];
  className?: string;
}

export function TitleCrewCollapsible({
  crew,
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
            <dd className="min-w-0 text-pretty text-sm text-zinc-600">{credit.names}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}

/** Standalone crew section with heading always visible. */
export function TitleCrewList({ crew }: TitleCrewCollapsibleProps) {
  if (crew.length === 0) return null;

  return (
    <section className="mt-6" aria-labelledby="title-crew-heading">
      <h2
        id="title-crew-heading"
        className="text-xs font-medium uppercase tracking-wide text-zinc-500"
      >
        Crew
      </h2>
      <TitleCrewCollapsible crew={crew} className="mt-3" />
    </section>
  );
}
