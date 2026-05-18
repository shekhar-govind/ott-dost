export {
  OTT_PLATFORM_GROUPS,
  OTT_PROVIDER_ALIAS_GROUPS,
  canonicalOttProviderId,
  chipCanonicalOttProviderId,
  dedupeOttProviderIds,
  expandProviderFilterIds,
  findOttPlatformGroup,
  findOttProviderOption,
  ottProviderIdsMatch,
  shouldShowOttProviderChip,
} from "./ott-platform-normalization";

export type { OttNormalizationTier, OttPlatformGroup } from "./ott-platform-normalization";
