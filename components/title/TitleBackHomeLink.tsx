export function TitleBackHomeLink() {
  return (
    <a
      href="/"
      className="inline-flex w-fit items-center gap-1.5 rounded-md py-0.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
    >
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden
        className="h-4 w-4 shrink-0"
      >
        <path
          fillRule="evenodd"
          d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
          clipRule="evenodd"
        />
      </svg>
      Home
    </a>
  );
}
