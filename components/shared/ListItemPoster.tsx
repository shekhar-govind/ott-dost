interface ListItemPosterProps {
  posterUrl: string | null;
  title: string;
}

export function ListItemPoster({ posterUrl, title }: ListItemPosterProps) {
  if (posterUrl) {
    return (
      <img
        src={posterUrl}
        alt=""
        width={32}
        height={48}
        className="h-12 w-8 shrink-0 rounded object-cover bg-zinc-100"
      />
    );
  }

  return (
    <div
      className="flex h-12 w-8 shrink-0 items-center justify-center rounded bg-zinc-100 text-[10px] font-medium text-zinc-400"
      aria-hidden
    >
      {title.slice(0, 1).toUpperCase()}
    </div>
  );
}
