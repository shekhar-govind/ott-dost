import { TMDB_IMAGE_BASE } from "@/lib/tmdb/constants";
import type { StreamingProvider, TmdbNetwork } from "@/lib/tmdb/types";

function getNetworkLogoUrl(logoPath: string | null | undefined): string | null {
  if (!logoPath) return null;
  return `${TMDB_IMAGE_BASE}/w92${logoPath}`;
}

/** TMDB network id → India watch provider id (curated; extend as needed). */
const NETWORK_ID_TO_PROVIDER_ID: Readonly<Record<number, number>> = {
  8036: 2336, // JioHotstar
};

/** India TV streaming providers for normalized name matching. */
const IN_STREAMING_PROVIDER_CATALOG: Readonly<
  { id: number; names: readonly string[] }[]
> = [
  { id: 2336, names: ["JioHotstar", "Hotstar", "Disney+ Hotstar"] },
  { id: 8, names: ["Netflix"] },
  { id: 119, names: ["Prime Video", "Amazon Prime Video"] },
  { id: 237, names: ["SonyLIV", "Sony Liv"] },
  { id: 232, names: ["Zee5", "ZEE5"] },
  { id: 532, names: ["Voot", "Voot Select"] },
  { id: 437, names: ["Apple TV", "Apple TV+"] },
  { id: 526, names: ["Discovery+"] },
  { id: 100, names: ["GuideDoc"] },
  { id: 315, names: ["Hoichoi"] },
  { id: 561, names: ["Sun NXT"] },
  { id: 483, names: ["aha"] },
  { id: 554, names: ["Planet Marathi"] },
];

function normalizeNetworkName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+with ads$/i, "")
    .replace(/\s+amazon channel$/i, "")
    .replace(/\s+channel$/i, "")
    .replace(/^amazon\s+/i, "")
    .replace(/\+/g, " plus ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isIndianNetwork(network: TmdbNetwork): boolean {
  return network.origin_country?.trim().toUpperCase() === "IN";
}

function findProviderByNormalizedName(
  networkName: string,
): { id: number; name: string } | null {
  const normalized = normalizeNetworkName(networkName);
  if (!normalized) return null;

  for (const entry of IN_STREAMING_PROVIDER_CATALOG) {
    for (const alias of entry.names) {
      const aliasNormalized = normalizeNetworkName(alias);
      if (
        normalized === aliasNormalized ||
        normalized.includes(aliasNormalized) ||
        aliasNormalized.includes(normalized)
      ) {
        return { id: entry.id, name: entry.names[0] };
      }
    }
  }

  return null;
}

function resolveProviderForNetwork(
  network: TmdbNetwork,
): StreamingProvider | null {
  const name = network.name?.trim();
  if (!name) return null;

  const mappedId = NETWORK_ID_TO_PROVIDER_ID[network.id];
  const matchedByName = findProviderByNormalizedName(name);
  const providerId = mappedId ?? matchedByName?.id;
  if (!providerId) return null;

  const providerName =
    IN_STREAMING_PROVIDER_CATALOG.find((entry) => entry.id === providerId)
      ?.names[0] ?? matchedByName?.name ?? name;

  return {
    id: providerId,
    name: providerName,
    logoUrl: getNetworkLogoUrl(network.logo_path),
  };
}

/** Infer India stream providers from TV networks when watch/providers is empty. */
export function resolveStreamProvidersFromNetworks(
  networks: TmdbNetwork[] | null | undefined,
): StreamingProvider[] {
  if (!networks?.length) return [];

  const seen = new Set<number>();
  const providers: StreamingProvider[] = [];

  for (const network of networks) {
    if (!isIndianNetwork(network)) continue;

    const provider = resolveProviderForNetwork(network);
    if (!provider || seen.has(provider.id)) continue;

    seen.add(provider.id);
    providers.push(provider);
  }

  return providers;
}
