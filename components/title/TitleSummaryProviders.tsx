import type { StreamingProvider, WatchAvailability } from "@/lib/tmdb/types";
import { hasWatchAvailability } from "@/lib/tmdb/utils";
import {
  getStreamGroupLabel,
  getStreamUnavailableMessage,
  NO_OTT_MESSAGE,
} from "@/lib/watch/availability-messages";

interface TitleSummaryProvidersProps {
  availability: WatchAvailability;
}

export function TitleSummaryProviders({ availability }: TitleSummaryProvidersProps) {
  const { stream, rent, buy, streamSource } = availability;
  const streamLabel = getStreamGroupLabel(streamSource);

  if (!hasWatchAvailability(availability)) {
    return (
      <div>
        <h3 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Where to watch
        </h3>
        <p className="mt-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-600">
          {NO_OTT_MESSAGE}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        Where to watch
      </h3>

      {stream.length > 0 ? (
        <ProviderGroup label={streamLabel} providers={stream} />
      ) : (
        <p className="text-sm text-zinc-500">
          {getStreamUnavailableMessage(availability)}
        </p>
      )}

      {rent.length > 0 && (
        <ProviderGroup label="Rent on" providers={rent} />
      )}

      {buy.length > 0 && <ProviderGroup label="Buy on" providers={buy} />}
    </div>
  );
}

function ProviderGroup({
  label,
  providers,
}: {
  label: string;
  providers: StreamingProvider[];
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-zinc-600">{label}</p>
      <ul className="flex flex-wrap gap-2">
        {providers.map((provider) => (
          <li
            key={`${label}-${provider.id}`}
            className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5"
          >
            <ProviderLogo provider={provider} />
            <span className="text-xs font-medium text-zinc-700">
              {provider.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProviderLogo({ provider }: { provider: StreamingProvider }) {
  if (provider.logoUrl) {
    return (
      <img
        src={provider.logoUrl}
        alt=""
        width={20}
        height={20}
        className="h-5 w-5 rounded object-contain"
      />
    );
  }

  return (
    <span className="flex h-5 w-5 items-center justify-center rounded bg-zinc-200 text-[9px] font-medium text-zinc-500">
      {provider.name.slice(0, 1)}
    </span>
  );
}
