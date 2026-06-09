import type { ReactNode } from "react";

interface LegalPageProps {
  title: string;
  children: ReactNode;
}

export function LegalPage({ title, children }: LegalPageProps) {
  return (
    <article className="mt-4 w-full">
      <header className="mb-6 border-b border-zinc-200 pb-4">
        <h1 className="text-pretty text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
          {title}
        </h1>
        <p className="mt-1 text-xs text-zinc-500">Last updated: May 2026</p>
      </header>
      <div className="prose-legal space-y-4 text-sm leading-relaxed text-zinc-600 sm:text-[0.9375rem]">
        {children}
      </div>
      <p className="mt-8">
        <a
          href="/"
          className="text-sm font-medium text-zinc-700 underline decoration-zinc-300 underline-offset-2 hover:text-zinc-900"
        >
          Back to home
        </a>
      </p>
    </article>
  );
}
