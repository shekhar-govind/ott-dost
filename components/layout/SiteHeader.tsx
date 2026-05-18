import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 bg-zinc-50/80 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-0.5 px-4 py-4 sm:flex-row sm:items-center sm:gap-3 sm:px-6 sm:py-5">
        <h1 className="text-base font-semibold tracking-tight text-zinc-900 sm:text-lg">
          <Link href="/" className="transition hover:text-zinc-600">
            OTT Dost
          </Link>
        </h1>
        <p className="text-xs text-zinc-500 sm:text-sm">Find where to watch</p>
      </div>
    </header>
  );
}
