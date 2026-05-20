import Link from "next/link";
import type { ReactNode } from "react";

const TMDB_URL = "https://www.themoviedb.org/";

const ATTRIBUTION_NOTICE =
  "This product uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB.";

function FooterLink({
  href,
  children,
  external,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
}) {
  const className =
    "text-sm text-zinc-500 transition-colors hover:text-zinc-900";

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-zinc-200/90 bg-gradient-to-b from-zinc-50/40 to-zinc-50">
      <div className="mx-auto w-full max-w-xl px-4 pt-10 pb-8 sm:max-w-2xl sm:px-6 lg:max-w-3xl lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1.5">
            <Link
              href="/"
              className="inline-block text-sm font-semibold tracking-tight text-zinc-900 transition-colors hover:text-zinc-600"
            >
              OTT Dost
            </Link>
            <p className="max-w-xs text-pretty text-xs leading-relaxed text-zinc-500">
              Find where to watch movies and TV shows in India.
            </p>
          </div>

          <nav
            className="flex shrink-0 items-center gap-5 sm:pt-0.5"
            aria-label="Legal"
          >
            <FooterLink href="/privacy">Privacy</FooterLink>
            <FooterLink href="/disclaimer">Disclaimer</FooterLink>
          </nav>
        </div>

        <div
          className="mt-8 flex flex-col gap-3.5 rounded-2xl border border-zinc-200/70 bg-white/70 p-4 shadow-sm shadow-zinc-900/2 sm:flex-row sm:items-center sm:gap-5 sm:p-5"
          aria-label="Data attribution"
        >
          <a
            href={TMDB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit shrink-0 rounded-lg bg-zinc-50 px-2.5 py-2 ring-1 ring-zinc-200/80 transition hover:bg-white hover:ring-zinc-300/80"
            aria-label="The Movie Database (TMDB)"
          >
            <img
              src="/tmdb-logo.svg"
              alt=""
              width={95}
              height={41}
              className="h-5 w-auto sm:h-[1.375rem]"
            />
          </a>
          <p className="min-w-0 text-pretty text-[11px] leading-relaxed text-zinc-500 sm:text-xs">
            {ATTRIBUTION_NOTICE}
          </p>
        </div>

        <div className="mt-7 flex flex-col items-center gap-2 border-t border-zinc-200/60 pt-6 sm:flex-row sm:justify-between">
          <p className="text-[11px] text-zinc-400">
            © {year} OTT Dost
          </p>
          <p className="text-[11px] text-zinc-400">
            Metadata by{" "}
            <a
              href={TMDB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-zinc-500 transition-colors hover:text-zinc-800"
            >
              TMDB
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
