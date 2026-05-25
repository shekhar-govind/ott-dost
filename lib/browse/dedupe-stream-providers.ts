import {
  chipCanonicalOttProviderId,
  findOttPlatformGroup,
} from "@/lib/browse/ott-platform-normalization";
import type { StreamingProvider } from "@/lib/tmdb/types";

/** Collapse alias/variant OTT ids for compact browse logo rows. */
export function dedupeStreamingProvidersForDisplay(
  providers: StreamingProvider[],
): StreamingProvider[] {
  const byKey = new Map<number, StreamingProvider>();

  for (const provider of providers) {
    const group = findOttPlatformGroup(provider.id);
    const dedupeKey =
      group && group.tier !== "parent-channel"
        ? chipCanonicalOttProviderId(provider.id)
        : provider.id;

    const existing = byKey.get(dedupeKey);
    if (!existing) {
      byKey.set(dedupeKey, provider);
      continue;
    }

    if (provider.id === dedupeKey && existing.id !== dedupeKey) {
      byKey.set(dedupeKey, provider);
    }
  }

  return [...byKey.values()];
}
