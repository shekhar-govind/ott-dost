import type { StreamingProvider } from "@/lib/tmdb/types";

interface StreamOnLabelProps {
  providers: StreamingProvider[];
  /** Tighter logo-only row (browse cards); default adds a bit more breathing room. */
  density?: "default" | "compact";
}

export function StreamOnLabel({
  providers,
  density = "default",
}: StreamOnLabelProps) {
  if (providers.length === 0) {
    return (
      <p
        className={
          density === "compact"
            ? "mt-1 text-[11px] text-zinc-400"
            : "mt-1 text-xs text-zinc-400"
        }
      >
        Not on any OTT platform
      </p>
    );
  }

  const isCompact = density === "compact";

  return (
    <div className={isCompact ? "mt-1.5" : "mt-1"}>
      <div
        className={`flex min-w-0 items-center gap-1.5 ${isCompact ? "" : "gap-2"}`}
      >
        <span
          className={`shrink-0 font-medium uppercase tracking-wide text-zinc-400 ${
            isCompact ? "text-[9px]" : "text-[10px] sm:text-xs"
          }`}
        >
          Stream
        </span>
        <ul
          className={`flex min-w-0 flex-1 flex-wrap items-center ${isCompact ? "gap-1" : "gap-1.5"}`}
          role="list"
          aria-label="Subscription streaming in India"
        >
          {providers.map((provider) => (
            <li key={provider.id}>
              <span
                className={`flex rounded-md bg-white shadow-sm ring-1 ring-zinc-200/60 ${
                  isCompact ? "p-px" : "p-0.5"
                }`}
                title={provider.name}
              >
                {provider.logoUrl ? (
                  <img
                    src={provider.logoUrl}
                    alt=""
                    width={22}
                    height={22}
                    className={
                      isCompact
                        ? "h-[22px] w-[22px] rounded object-contain"
                        : "h-6 w-6 rounded object-contain"
                    }
                  />
                ) : (
                  <span
                    className={`flex items-center justify-center rounded bg-zinc-100 text-[9px] font-semibold text-zinc-500 ${
                      isCompact ? "h-[22px] min-w-[22px] px-0.5" : "h-6 min-w-[24px] px-1"
                    }`}
                  >
                    {provider.name.slice(0, 1)}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
