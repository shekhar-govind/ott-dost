import { chipCanonicalOttProviderId } from "./ott-platform-normalization";

/** Sort and dedupe positive integers (stable canonical order for URL keys). */
export function normalizePositiveIntegerIds(ids: readonly number[]): number[] {
  const unique = [...new Set(ids.filter((id) => Number.isInteger(id) && id > 0))];
  unique.sort((a, b) => a - b);
  return unique;
}

/** Canonical provider chip ids for stable `ott=` serialization. */
export function normalizeBrowseProviderIds(providerIds: readonly number[]): number[] {
  const seen = new Set<number>();
  const normalized: number[] = [];

  for (const providerId of providerIds) {
    if (!Number.isInteger(providerId) || providerId <= 0) continue;
    const canonicalId = chipCanonicalOttProviderId(providerId);
    if (seen.has(canonicalId)) continue;
    seen.add(canonicalId);
    normalized.push(canonicalId);
  }

  normalized.sort((a, b) => a - b);
  return normalized;
}

const MULTI_VALUE_QUERY_KEYS = new Set(["genre", "ott"]);

function canonicalizeMultiValueParam(value: string): string {
  const parts = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length <= 1) return parts[0] ?? value;

  const numeric = parts.every((part) => /^\d+$/.test(part));
  if (numeric) {
    return normalizePositiveIntegerIds(parts.map(Number)).join(",");
  }

  return [...new Set(parts.map((part) => part.toLowerCase()))].sort().join(",");
}

/**
 * Canonical browse filter query string: sorted keys, normalized multi-value
 * params (`genre`, `ott`), defaults omitted where serialize would drop them.
 */
export function canonicalizeBrowseFilterQuery(query: string): string {
  const params = new URLSearchParams(query);
  const canonical = new URLSearchParams();

  const keys = [...new Set([...params.keys()])].sort();
  for (const key of keys) {
    const value = params.get(key);
    if (value == null) continue;
    canonical.set(
      key,
      MULTI_VALUE_QUERY_KEYS.has(key) ? canonicalizeMultiValueParam(value) : value,
    );
  }

  return canonical.toString();
}
