import type { ReactNode } from "react";
import {
  buildFooterBrowseTaxonomy,
  type FooterBrowseFacetRow,
  type FooterBrowseLanguageSection,
} from "@/lib/browse/footer-browse-taxonomy";
import {
  FOOTER_BROWSE_HUB_LINKS,
  FOOTER_BROWSE_POPULAR_LINKS,
} from "@/lib/browse/special-page-discovery-links";

const COMPACT_LINK_CLASS =
  "text-xs text-zinc-500 transition-colors hover:text-zinc-900";

const HUB_PILL_CLASS =
  "inline-flex rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900";

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
      {children}
    </p>
  );
}

function DotSep() {
  return <span className="text-zinc-300" aria-hidden>·</span>;
}

function MediaPairLinks({
  moviesHref,
  tvHref,
  tvLabel = "TV",
}: {
  moviesHref: string;
  tvHref: string;
  tvLabel?: string;
}) {
  return (
    <>
      <a href={moviesHref} className={COMPACT_LINK_CLASS}>
        Movies
      </a>
      <DotSep />
      <a href={tvHref} className={COMPACT_LINK_CLASS}>
        {tvLabel}
      </a>
    </>
  );
}

function FacetRow({ row }: { row: FooterBrowseFacetRow }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className="min-w-[4.75rem] text-xs font-medium text-zinc-700">
        {row.label}
      </span>
      <MediaPairLinks moviesHref={row.moviesHref} tvHref={row.tvHref} />
    </div>
  );
}

function LanguageAccordion({ section }: { section: FooterBrowseLanguageSection }) {
  const linkCount = 2 + section.providerCombos.length * 2;

  return (
    <details className="group border-b border-zinc-100 last:border-b-0">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-2.5 text-xs font-medium text-zinc-800 [&::-webkit-details-marker]:hidden">
        <span>{section.label}</span>
        <span className="flex shrink-0 items-center gap-2 text-zinc-400">
          <span className="text-[10px] font-normal tabular-nums">{linkCount}</span>
          <span
            className="transition-transform group-open:rotate-180"
            aria-hidden
          >
            ▾
          </span>
        </span>
      </summary>
      <div className="space-y-2.5 pb-3 pl-0.5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <MediaPairLinks
            moviesHref={section.moviesHref}
            tvHref={section.tvHref}
            tvLabel="TV shows"
          />
        </div>
        {section.providerCombos.map((combo) => (
          <div
            key={combo.slug}
            className="flex flex-wrap items-center gap-x-2 gap-y-1"
          >
            <span className="min-w-[4.75rem] text-xs text-zinc-600">
              on {combo.label}
            </span>
            <MediaPairLinks
              moviesHref={combo.moviesHref}
              tvHref={combo.tvHref}
            />
          </div>
        ))}
      </div>
    </details>
  );
}

export function FooterBrowseNav({ className = "" }: { className?: string }) {
  const { languageRows, platformRows, languageSections } =
    buildFooterBrowseTaxonomy();

  return (
    <nav
      className={`w-full ${className}`.trim()}
      aria-label="Browse movies and TV shows"
    >
      <StackSection>
        <SectionLabel>Browse</SectionLabel>
        <ul className="flex flex-wrap gap-2">
          {FOOTER_BROWSE_HUB_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className={HUB_PILL_CLASS}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </StackSection>

      {FOOTER_BROWSE_POPULAR_LINKS.length > 0 ? (
        <StackSection className="mt-6">
          <SectionLabel>Popular</SectionLabel>
          <ul className="flex flex-wrap gap-x-3 gap-y-1.5">
            {FOOTER_BROWSE_POPULAR_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-xs font-medium text-zinc-600 transition-colors hover:text-zinc-900"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </StackSection>
      ) : null}

      <div className="mt-6 grid gap-8 sm:grid-cols-2">
        <div>
          <SectionLabel>Languages</SectionLabel>
          <div className="mt-3 space-y-2">
            {languageRows.map((row) => (
              <FacetRow key={row.slug} row={row} />
            ))}
          </div>
        </div>
        <div>
          <SectionLabel>Platforms</SectionLabel>
          <div className="mt-3 space-y-2">
            {platformRows.map((row) => (
              <FacetRow key={row.slug} row={row} />
            ))}
          </div>
        </div>
      </div>

      <StackSection className="mt-6">
        <SectionLabel>More by language</SectionLabel>
        <div className="mt-2">
          {languageSections.map((section) => (
            <LanguageAccordion key={section.slug} section={section} />
          ))}
        </div>
      </StackSection>
    </nav>
  );
}

function StackSection({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`space-y-2.5 ${className}`.trim()}>{children}</div>;
}
