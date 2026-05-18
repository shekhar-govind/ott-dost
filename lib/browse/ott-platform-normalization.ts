/**
 * OTT platform normalization for India browse filters.
 *
 * - alias: same brand, different TMDB ids → one chip, full group when filtering
 * - variant: product SKUs (e.g. Prime with Ads) → one chip, full group when filtering
 * - parent-channel: separate chips; selecting the parent also matches its channel id
 */

export type OttNormalizationTier = "alias" | "variant" | "parent-channel";

export interface OttPlatformGroup {
  readonly canonicalId: number;
  readonly ids: readonly number[];
  readonly tier: OttNormalizationTier;
}

export const OTT_PLATFORM_GROUPS: readonly OttPlatformGroup[] = [
  // Tier A — alias ids (same brand; 515 is MX Player in TMDB IN — do not group with Hotstar)
  { canonicalId: 2336, ids: [2336, 122], tier: "alias" }, // JioHotstar + legacy Hotstar id

  // Tier B — product variants
  { canonicalId: 119, ids: [119, 2100], tier: "variant" }, // Prime Video / Prime with Ads
  { canonicalId: 8, ids: [8, 175], tier: "variant" }, // Netflix / Netflix Kids

  // Tier C — parent + distribution channel (separate chips; parent expands when filtering)
  { canonicalId: 283, ids: [283, 1968], tier: "parent-channel" },
  { canonicalId: 510, ids: [510, 584], tier: "parent-channel" },
  { canonicalId: 315, ids: [315, 2176], tier: "parent-channel" },
  { canonicalId: 561, ids: [561, 2074, 2053], tier: "parent-channel" },
  { canonicalId: 482, ids: [482, 2177], tier: "parent-channel" },
  { canonicalId: 11, ids: [11, 201], tier: "parent-channel" },
  { canonicalId: 538, ids: [538, 2077], tier: "parent-channel" },
  { canonicalId: 350, ids: [350, 2243], tier: "parent-channel" },
  { canonicalId: 190, ids: [190, 603], tier: "parent-channel" },
];

const GROUP_BY_PROVIDER_ID = new Map<number, OttPlatformGroup>(
  OTT_PLATFORM_GROUPS.flatMap((group) => group.ids.map((id) => [id, group] as const)),
);

export function findOttPlatformGroup(providerId: number): OttPlatformGroup | undefined {
  return GROUP_BY_PROVIDER_ID.get(providerId);
}

/** Id used for chip selection state and URL (collapses alias + variant groups). */
export function chipCanonicalOttProviderId(providerId: number): number {
  const group = findOttPlatformGroup(providerId);
  if (!group || group.tier === "parent-channel") return providerId;
  return group.canonicalId;
}

export function ottProviderIdsMatch(
  selectedId: number,
  optionId: number,
): boolean {
  return chipCanonicalOttProviderId(selectedId) === chipCanonicalOttProviderId(optionId);
}

export function findOttProviderOption<
  T extends { id: number },
>(providerOptions: readonly T[], providerId: number): T | undefined {
  return providerOptions.find(
    (option) =>
      option.id === providerId || ottProviderIdsMatch(providerId, option.id),
  );
}

/** Whether this provider gets its own tile in the filter sheet. */
export function shouldShowOttProviderChip(providerId: number): boolean {
  const group = findOttPlatformGroup(providerId);
  if (!group || group.tier === "parent-channel") return true;
  return providerId === group.canonicalId;
}

/** Collapse alias/variant ids; keep the TMDB id from the list (not the group canonical). */
export function dedupeOttProviderIds(providerIds: number[]): number[] {
  const seen = new Set<number>();
  const deduped: number[] = [];

  for (const providerId of providerIds) {
    const canonicalId = chipCanonicalOttProviderId(providerId);
    if (seen.has(canonicalId)) continue;
    seen.add(canonicalId);
    deduped.push(providerId);
  }

  return deduped;
}

/**
 * TMDB `with_watch_providers` ids (pipe/OR) for discover.
 * - alias / variant: expand to full group
 * - parent-channel: parent expands to channel ids; channel alone stays narrow
 */
export function expandProviderIdsForDiscover(providerIds: number[]): number[] {
  if (providerIds.length === 0) return [];

  const expanded = new Set<number>();

  for (const providerId of providerIds) {
    expanded.add(providerId);
    const group = findOttPlatformGroup(providerId);
    if (!group) continue;

    if (group.tier === "parent-channel") {
      if (providerId === group.canonicalId) {
        for (const memberId of group.ids) expanded.add(memberId);
      }
      continue;
    }

    for (const memberId of group.ids) expanded.add(memberId);
  }

  return [...expanded].sort((a, b) => a - b);
}

/** Pipe-separated value for discover `with_watch_providers` (OR semantics). */
export function formatTmdbWithWatchProviders(providerIds: number[]): string | undefined {
  const expanded = expandProviderIdsForDiscover(providerIds);
  if (expanded.length === 0) return undefined;
  return expanded.join("|");
}

/** @deprecated Use {@link expandProviderIdsForDiscover} */
export function expandProviderFilterIds(providerIds: number[]): Set<number> {
  return new Set(expandProviderIdsForDiscover(providerIds));
}

/** @deprecated Use {@link OTT_PLATFORM_GROUPS} */
export const OTT_PROVIDER_ALIAS_GROUPS: readonly number[][] = OTT_PLATFORM_GROUPS.filter(
  (group) => group.tier === "alias",
).map((group) => [...group.ids]);

/** @deprecated Use {@link chipCanonicalOttProviderId} */
export const canonicalOttProviderId = chipCanonicalOttProviderId;
