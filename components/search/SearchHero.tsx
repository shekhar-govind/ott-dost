import { SearchBox } from "./SearchBox";

export function SearchHero() {
  return (
    <section className="mx-auto w-full max-w-xl px-4 py-16">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
          What do you want to watch?
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          Search movies, web series, and documentaries
        </p>
      </div>
      <SearchBox />
    </section>
  );
}
