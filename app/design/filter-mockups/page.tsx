import type { ReactNode } from "react";

const MOCK_ITEMS = [
  {
    title: "Kantara",
    meta: "Movie · 8.2 · 2022 · Kannada",
    genres: "Action · Drama",
    providers: "Netflix",
  },
  {
    title: "Panchayat",
    meta: "TV · 8.8 · 2020 · Hindi",
    genres: "Comedy · Drama",
    providers: "Prime Video",
  },
  {
    title: "Premalu",
    meta: "Movie · 7.9 · 2024 · Malayalam",
    genres: "Romance · Comedy",
    providers: "Disney+ Hotstar",
  },
] as const;

function MockSearch() {
  return (
    <div className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-base text-zinc-400 shadow-sm sm:py-3 sm:text-sm">
      Search movies and TV shows…
    </div>
  );
}

function MockBrowseList({ count = 3 }: { count?: number }) {
  return (
    <section className="mt-6 w-full">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-zinc-900">
            Latest movies and TV shows
          </h3>
          <p className="mt-0.5 text-xs text-zinc-500">English · Hindi · Malayalam</p>
        </div>
        <span className="shrink-0 text-xs font-medium text-zinc-500">Refresh</span>
      </div>
      <ul className="space-y-1.5">
        {MOCK_ITEMS.slice(0, count).map((item) => (
          <li
            key={item.title}
            className="flex min-h-14 items-start gap-2.5 rounded-lg border border-zinc-100 bg-white px-2.5 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:gap-3 sm:px-3 sm:py-2.5"
          >
            <div className="h-[3.25rem] w-[2.2rem] shrink-0 rounded bg-zinc-200 sm:h-14 sm:w-[2.35rem]" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-medium text-zinc-900 sm:text-base">{item.title}</p>
              <p className="mt-px truncate text-[11px] text-zinc-400">{item.meta}</p>
              <p className="mt-1 truncate text-[11px] text-zinc-400">{item.genres}</p>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                Stream on {item.providers}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Hero() {
  return (
    <div className="mb-5 text-center sm:mb-6">
      <h2 className="text-pretty text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
        What do you want to watch?
      </h2>
      <p className="mt-2 text-sm text-zinc-500">Search movies and TV shows</p>
    </div>
  );
}

function MiniHeader() {
  return (
    <>
      <p className="text-base font-semibold text-zinc-900">OTT Dost</p>
      <p className="text-xs text-zinc-500">Find where to watch</p>
      <hr className="my-3 border-zinc-200" />
    </>
  );
}

function Chip({
  children,
  active,
  className = "",
}: {
  children: ReactNode;
  active?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        active ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600"
      } ${className}`}
    >
      {children}
    </span>
  );
}

function PhoneFrame({
  label,
  children,
  overlay,
}: {
  label: string;
  children: ReactNode;
  overlay?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</p>
      <div className="relative mx-auto w-full max-w-[390px] overflow-hidden rounded-[2rem] border-4 border-zinc-900 bg-zinc-50">
        <div className="max-h-[720px] overflow-hidden">{children}</div>
        {overlay}
      </div>
    </div>
  );
}

function DesktopFrame({
  label,
  children,
  overlay,
}: {
  label: string;
  children: ReactNode;
  overlay?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</p>
      <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
        <div className="max-h-[520px] overflow-hidden px-8 py-6">{children}</div>
        {overlay}
      </div>
    </div>
  );
}

function FilterLane({
  label,
  chips,
  activeIndex,
}: {
  label: string;
  chips: string[];
  activeIndex: number;
}) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500">{label}</p>
      <div className="flex gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {chips.map((chip, i) => (
          <Chip key={chip} active={i === activeIndex}>
            {chip}
          </Chip>
        ))}
      </div>
    </div>
  );
}

function SidebarGroup({
  label,
  options,
  active,
  multi,
}: {
  label: string;
  options: string[];
  active: number;
  multi?: boolean;
}) {
  return (
    <div className="mb-3">
      <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500">{label}</p>
      <div className="flex flex-wrap gap-1">
        {options.map((opt, i) => (
          <Chip key={opt} active={multi ? i <= active : i === active} className="!text-[10px]">
            {opt}
          </Chip>
        ))}
      </div>
    </div>
  );
}

function Option1Mobile() {
  return (
    <PhoneFrame
      label="Mobile"
      overlay={
        <div className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-zinc-200 bg-white px-4 pb-5 pt-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-zinc-300" />
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-zinc-900">Filters</p>
            <button type="button" className="text-sm font-semibold text-zinc-900">
              Apply
            </button>
          </div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500">Language</p>
          <div className="mb-4 flex flex-wrap gap-1.5">
            <Chip active>EN</Chip>
            <Chip active>हिं</Chip>
            <Chip>മല</Chip>
          </div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500">Streaming on</p>
          <div className="grid grid-cols-4 gap-2">
            {["N", "P", "D+", "Z"].map((logo, i) => (
              <div
                key={logo}
                className={`flex h-11 items-center justify-center rounded-xl border text-xs font-bold ${
                  i === 0
                    ? "border-zinc-900 bg-zinc-50 ring-2 ring-zinc-900"
                    : "border-zinc-200 bg-white text-zinc-600"
                }`}
              >
                {logo}
              </div>
            ))}
          </div>
        </div>
      }
    >
      <div className="px-4 pb-44 pt-3">
        <MiniHeader />
        <Hero />
        <MockSearch />
        <div className="mt-4 space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Filters
              <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-white/20 px-1 text-[10px]">
                3
              </span>
            </button>
            <div className="flex rounded-full border border-zinc-200 bg-white p-0.5 text-[11px]">
              <span className="rounded-full bg-zinc-900 px-2.5 py-1 font-medium text-white">All</span>
              <span className="px-2.5 py-1 text-zinc-500">Movies</span>
              <span className="px-2.5 py-1 text-zinc-500">TV</span>
            </div>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            <Chip active>Hindi ×</Chip>
            <Chip active>Netflix ×</Chip>
            <Chip active>Action ×</Chip>
            <span className="shrink-0 py-1 text-xs font-medium text-zinc-500">Clear</span>
          </div>
        </div>
        <MockBrowseList count={2} />
      </div>
    </PhoneFrame>
  );
}

function Option2Mobile() {
  return (
    <PhoneFrame label="Mobile">
      <div className="px-4 pb-4 pt-3">
        <MiniHeader />
        <Hero />
        <MockSearch />
        <div className="mt-4 space-y-3">
          <FilterLane label="Language" chips={["All", "EN", "हिं", "മല", "+"]} activeIndex={2} />
          <FilterLane label="Type" chips={["All", "Movies", "TV"]} activeIndex={1} />
          <FilterLane label="Genres" chips={["Action", "Comedy", "Drama", "+ More"]} activeIndex={0} />
          <FilterLane label="OTT" chips={["All", "N", "P", "D+", "+"]} activeIndex={1} />
          <div>
            <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500">Released</p>
            <Chip active className="!rounded-lg !px-3">
              2020 – 2026 ▾
            </Chip>
          </div>
        </div>
        <MockBrowseList count={2} />
      </div>
    </PhoneFrame>
  );
}

function Option3Mobile() {
  return (
    <PhoneFrame label="Mobile">
      <div className="px-4 pb-4 pt-3">
        <MiniHeader />
        <Hero />
        <div className="rounded-xl border border-zinc-300 bg-white px-4 py-3.5 text-sm text-zinc-900 shadow-sm ring-2 ring-zinc-100">
          hindi netflix action 2024
          <span className="ml-0.5 inline-block h-4 w-px animate-pulse bg-zinc-900 align-middle" />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Chip active>Language: Hindi</Chip>
          <Chip active>Netflix</Chip>
          <Chip active>Action</Chip>
          <Chip active>2024</Chip>
        </div>
        <ul className="mt-3 rounded-xl border border-zinc-200 bg-white py-1 shadow-sm">
          {["Filter by language: Hindi", "Filter by platform: Netflix", "Filter by genre: Action"].map(
            (suggestion) => (
              <li
                key={suggestion}
                className="border-b border-zinc-100 px-3 py-2.5 text-sm text-zinc-700 last:border-0"
              >
                {suggestion}
              </li>
            ),
          )}
        </ul>
        <MockBrowseList count={2} />
      </div>
    </PhoneFrame>
  );
}

function Option4MobileCollapsed() {
  return (
    <PhoneFrame label="Mobile (collapsed)">
      <div className="px-4 pb-4 pt-3">
        <MiniHeader />
        <Hero />
        <MockSearch />
        <button
          type="button"
          className="mt-4 flex w-full items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-left shadow-sm"
        >
          <span className="text-sm font-semibold text-zinc-900">Refine results</span>
          <span className="text-xs text-zinc-500">3 active · Tap to expand</span>
        </button>
        <MockBrowseList count={2} />
      </div>
    </PhoneFrame>
  );
}

function Option4MobileExpanded() {
  return (
    <PhoneFrame label="Mobile (expanded)">
      <div className="px-4 pb-4 pt-3">
        <MiniHeader />
        <Hero />
        <MockSearch />
        <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex justify-between">
            <p className="text-sm font-semibold text-zinc-900">Refine results</p>
            <span className="text-xs font-medium text-zinc-500">Reset</span>
          </div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-zinc-500">Type</p>
          <div className="mb-3 flex rounded-full border border-zinc-200 p-0.5 text-[11px]">
            <span className="flex-1 rounded-full py-1 text-center text-zinc-500">All</span>
            <span className="flex-1 rounded-full bg-zinc-900 py-1 text-center font-medium text-white">
              Movies
            </span>
            <span className="flex-1 rounded-full py-1 text-center text-zinc-500">TV</span>
          </div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-zinc-500">Year range</p>
          <div className="mb-1 h-1.5 rounded-full bg-zinc-100">
            <div className="relative mx-6 h-full rounded-full bg-zinc-900">
              <span className="absolute -left-2 -top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-zinc-900" />
              <span className="absolute -right-2 -top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-zinc-900" />
            </div>
          </div>
          <p className="mb-3 text-center text-[11px] text-zinc-500">2018 – 2024</p>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-zinc-500">OTT</p>
          <div className="grid grid-cols-4 gap-1.5">
            {["N", "P", "D+", "—"].map((logo, i) => (
              <div
                key={logo}
                className={`flex h-9 items-center justify-center rounded-lg border text-[10px] font-bold ${
                  i < 2 ? "border-zinc-900 bg-zinc-50" : "border-zinc-200"
                }`}
              >
                {logo}
              </div>
            ))}
          </div>
        </div>
        <MockBrowseList count={2} />
      </div>
    </PhoneFrame>
  );
}

function Option5Mobile() {
  return (
    <PhoneFrame label="Mobile (full screen)">
      <div className="flex min-h-[640px] flex-col bg-zinc-50">
        <div className="flex items-center gap-3 border-b border-zinc-200 bg-white px-4 py-3">
          <span className="text-lg text-zinc-400">←</span>
          <p className="text-sm font-semibold text-zinc-900">Filters</p>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <SidebarGroup label="Type" options={["All", "Movies", "TV"]} active={1} />
          <SidebarGroup label="Language" options={["EN", "हिं", "മല"]} active={1} multi />
          <SidebarGroup label="Genres" options={["Action", "Comedy", "Drama"]} active={0} multi />
          <p className="mb-1.5 mt-4 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
            Date range
          </p>
          <Chip active className="!rounded-lg">
            2020 – 2026
          </Chip>
          <p className="mb-2 mt-4 text-[10px] font-medium uppercase tracking-wide text-zinc-500">OTT</p>
          <div className="grid grid-cols-3 gap-2">
            {["Netflix", "Prime", "Hotstar"].map((p, i) => (
              <div
                key={p}
                className={`rounded-xl border px-2 py-3 text-center text-[10px] font-medium ${
                  i === 0 ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 bg-white"
                }`}
              >
                {p}
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-zinc-200 bg-white p-4">
          <button type="button" className="w-full rounded-xl bg-zinc-900 py-3 text-sm font-semibold text-white">
            Show 42 titles
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
}

function Option1Desktop() {
  return (
    <DesktopFrame
      label="Desktop"
      overlay={
        <div className="absolute inset-0 flex items-start justify-center bg-black/20 pt-12">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6">
            <p className="mb-4 text-lg font-semibold text-zinc-900">Filters</p>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">Genres</p>
            <div className="mb-4 flex flex-wrap gap-1.5">
              {["Action", "Comedy", "Drama", "Horror", "Romance"].map((g, i) => (
                <Chip key={g} active={i < 2}>
                  {g}
                </Chip>
              ))}
            </div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">Released</p>
            <div className="flex gap-2">
              <Chip active>2020s</Chip>
              <Chip>Last 5 years</Chip>
              <Chip>Custom</Chip>
            </div>
            <button type="button" className="mt-6 w-full rounded-xl bg-zinc-900 py-2.5 text-sm font-semibold text-white">
              Apply filters
            </button>
          </div>
        </div>
      }
    >
      <div className="mx-auto max-w-3xl">
        <Hero />
        <MockSearch />
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button type="button" className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white">
            Filters · 3
          </button>
          <div className="flex rounded-full border border-zinc-200 bg-white p-1 text-sm">
            <span className="rounded-full bg-zinc-900 px-3 py-1 text-white">All</span>
            <span className="px-3 py-1 text-zinc-500">Movies</span>
            <span className="px-3 py-1 text-zinc-500">TV</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Chip active>Hindi</Chip>
            <Chip active>Netflix</Chip>
            <Chip active>Action</Chip>
          </div>
        </div>
        <MockBrowseList />
      </div>
    </DesktopFrame>
  );
}

function Option2Desktop() {
  return (
    <DesktopFrame label="Desktop">
      <div className="mx-auto max-w-3xl">
        <Hero />
        <MockSearch />
        <div className="mt-5 space-y-2.5 rounded-xl border border-zinc-100 bg-white/80 p-3">
          <FilterLane label="Language" chips={["All", "EN", "हिं", "മല", "Tamil", "Telugu"]} activeIndex={2} />
          <FilterLane label="Type" chips={["All", "Movies", "TV"]} activeIndex={0} />
          <FilterLane
            label="Genres"
            chips={["Action", "Comedy", "Drama", "Thriller", "Romance", "Horror", "+ More"]}
            activeIndex={0}
          />
          <FilterLane label="OTT" chips={["All", "Netflix", "Prime", "Hotstar", "Zee5", "+"]} activeIndex={1} />
        </div>
        <MockBrowseList />
      </div>
    </DesktopFrame>
  );
}

function Option3Desktop() {
  return (
    <DesktopFrame label="Desktop">
      <div className="mx-auto max-w-3xl">
        <Hero />
        <div className="rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm shadow-sm ring-2 ring-zinc-100">
          <span className="text-zinc-400">Search or filter: </span>
          <span className="text-zinc-900">hindi netflix action</span>
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          Press <kbd className="rounded border border-zinc-200 bg-zinc-100 px-1">⌘K</kbd> for filter palette
        </p>
        <MockBrowseList />
      </div>
    </DesktopFrame>
  );
}

function Option4Desktop() {
  return (
    <DesktopFrame label="Desktop">
      <div className="mx-auto max-w-3xl">
        <Hero />
        <MockSearch />
        <div className="mt-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex justify-between">
            <p className="font-semibold text-zinc-900">Refine results</p>
            <span className="text-sm text-zinc-500">Reset all</span>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">Language</p>
              <div className="flex flex-wrap gap-1.5">
                <Chip active>EN</Chip>
                <Chip active>हिं</Chip>
                <Chip>മല</Chip>
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">Streaming on</p>
              <div className="grid grid-cols-4 gap-2">
                {["N", "P", "D+", "Z"].map((l, i) => (
                  <div
                    key={l}
                    className={`flex h-10 items-center justify-center rounded-xl border font-bold ${
                      i === 0 ? "border-zinc-900 ring-2 ring-zinc-900" : "border-zinc-200"
                    }`}
                  >
                    {l}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <MockBrowseList />
      </div>
    </DesktopFrame>
  );
}

function Option5Desktop() {
  return (
    <DesktopFrame label="Desktop">
      <div className="mx-auto flex max-w-5xl gap-6">
        <aside className="w-52 shrink-0 rounded-2xl border border-zinc-200 bg-white p-4">
          <p className="mb-4 text-sm font-semibold text-zinc-900">Filters</p>
          <SidebarGroup label="Type" options={["All", "Movies", "TV"]} active={1} />
          <SidebarGroup label="Language" options={["EN", "हिं", "മല"]} active={1} multi />
          <SidebarGroup label="Genres" options={["Action", "Comedy"]} active={0} multi />
          <p className="mb-1.5 mt-3 text-[10px] font-medium uppercase tracking-wide text-zinc-500">Year</p>
          <p className="text-xs text-zinc-600">2020 – 2026</p>
          <p className="mb-1.5 mt-3 text-[10px] font-medium uppercase tracking-wide text-zinc-500">OTT</p>
          <div className="grid grid-cols-2 gap-1.5">
            <Chip active>N</Chip>
            <Chip>P</Chip>
          </div>
          <button type="button" className="mt-4 w-full rounded-xl bg-zinc-900 py-2 text-xs font-semibold text-white">
            Apply
          </button>
        </aside>
        <div className="min-w-0 flex-1">
          <Hero />
          <MockSearch />
          <MockBrowseList />
        </div>
      </div>
    </DesktopFrame>
  );
}

function ReferenceMobile() {
  return (
    <PhoneFrame label="Current home (no filters)">
      <div className="px-4 pb-4 pt-3">
        <MiniHeader />
        <Hero />
        <MockSearch />
        <section className="mt-6">
          <div className="mb-3 flex justify-between">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Latest movies and TV shows</h3>
              <p className="mt-0.5 text-xs text-zinc-500">English · Hindi · Malayalam</p>
            </div>
            <span className="text-xs text-zinc-500">Refresh</span>
          </div>
          <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-500">
            No titles with OTT availability on this page.
          </p>
        </section>
      </div>
    </PhoneFrame>
  );
}

function OptionSection({
  number,
  title,
  description,
  previews,
}: {
  number: number;
  title: string;
  description: string;
  previews: ReactNode;
}) {
  return (
    <section className="border-b border-zinc-200 py-12 last:border-0">
      <div className="mb-8">
        <p className="text-sm font-semibold text-zinc-400">Option {number}</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600">{description}</p>
      </div>
      <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">{previews}</div>
    </section>
  );
}

export default function FilterMockupsPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Filter UI mockups</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Visual previews based on the OTT Dost home page · Sample list data for illustration
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-16">
        <section className="border-b border-zinc-200 py-12">
          <h2 className="text-xl font-semibold text-zinc-900">Live home page (reference)</h2>
          <p className="mt-2 mb-8 text-sm text-zinc-500">Your current UI before filters are added</p>
          <div className="grid gap-8 lg:grid-cols-2">
            <ReferenceMobile />
          </div>
        </section>

        <OptionSection
          number={1}
          title="Filter bar + bottom sheet"
          description="Filters button with badge, inline Movie/TV segment, active chips row, and a bottom sheet for deeper filters on mobile."
          previews={
            <>
              <Option1Mobile />
              <Option1Desktop />
            </>
          }
        />

        <OptionSection
          number={2}
          title="Horizontal filter lanes"
          description="Scrollable chip rows per dimension — quick browsing without opening a modal."
          previews={
            <>
              <Option2Mobile />
              <Option2Desktop />
            </>
          }
        />

        <OptionSection
          number={3}
          title="Smart filter / command style"
          description="Natural-language style input with token chips and autocomplete suggestions."
          previews={
            <>
              <Option3Mobile />
              <Option3Desktop />
            </>
          }
        />

        <OptionSection
          number={4}
          title="Collapsible refine card"
          description="Single card that collapses on mobile and expands to show all controls."
          previews={
            <>
              <Option4MobileCollapsed />
              <Option4MobileExpanded />
              <Option4Desktop />
            </>
          }
        />

        <OptionSection
          number={5}
          title="Sidebar filter rail"
          description="Persistent left sidebar on desktop; full-screen filter page on mobile."
          previews={
            <>
              <Option5Mobile />
              <Option5Desktop />
            </>
          }
        />
      </main>
    </div>
  );
}
