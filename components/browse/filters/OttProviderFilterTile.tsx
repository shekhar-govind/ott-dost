import type { BrowseOttProvider } from "@/lib/browse/types";

interface OttProviderFilterTileProps {
  provider: BrowseOttProvider;
  active: boolean;
  onToggle: () => void;
}

export function OttProviderFilterTile({
  provider,
  active,
  onToggle,
}: OttProviderFilterTileProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      aria-label={provider.name}
      title={provider.name}
      className={`flex aspect-square flex-col items-center justify-center rounded-xl border p-2 transition ${
        active
          ? "border-zinc-900 bg-zinc-50 ring-2 ring-zinc-900"
          : "border-zinc-200 bg-white hover:border-zinc-300"
      }`}
    >
      {provider.logoUrl ? (
        <span className="flex rounded-md bg-white p-0.5 ring-1 ring-zinc-200/60">
          <img
            src={provider.logoUrl}
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
          />
        </span>
      ) : (
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-zinc-100 text-sm font-bold text-zinc-600">
          {provider.shortLabel}
        </span>
      )}
      <span className="mt-1 line-clamp-1 w-full text-center text-[9px] font-medium leading-tight text-zinc-500">
        {provider.name.split(" ")[0]}
      </span>
    </button>
  );
}
