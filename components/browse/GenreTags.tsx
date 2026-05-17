interface GenreTagsProps {
  genres: string[];
}

export function GenreTags({ genres }: GenreTagsProps) {
  if (genres.length === 0) return null;

  return (
    <ul className="mt-1.5 flex flex-wrap gap-1">
      {genres.map((genre) => (
        <li
          key={genre}
          className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 sm:text-xs"
        >
          {genre}
        </li>
      ))}
    </ul>
  );
}
