import Link from "next/link";

export function TitleNotFound() {
  return (
    <article
      className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm sm:p-8"
      aria-labelledby="title-not-found-heading"
    >
      <div
        className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-zinc-400"
        aria-hidden
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-7 w-7"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.5 4.5h9M6 4.5v15a1.5 1.5 0 0 0 1.5 1.5h9A1.5 1.5 0 0 0 18 19.5v-15M9.75 9.75h4.5M9.75 13.5h4.5"
          />
        </svg>
      </div>

      <h2
        id="title-not-found-heading"
        className="text-pretty text-lg font-semibold tracking-tight text-zinc-900 sm:text-xl"
      >
        Movie or TV show not found
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-pretty text-sm leading-relaxed text-zinc-500 sm:text-base">
        The title you were looking for doesn&apos;t exist or may have been removed.
        Try searching for another movie or show above.
      </p>

      <Link
        href="/"
        className="mt-6 inline-flex items-center justify-center rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700"
      >
        Back to home
      </Link>
    </article>
  );
}
