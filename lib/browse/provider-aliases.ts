/** TMDB may list the same Indian service under different provider ids. */
const OTT_PROVIDER_ALIAS_GROUPS: readonly number[][] = [
  [122, 515], // Disney+ Hotstar / JioHotstar
];

export function expandProviderFilterIds(providerIds: number[]): Set<number> {
  if (providerIds.length === 0) return new Set();

  const expanded = new Set(providerIds);
  for (const id of providerIds) {
    for (const group of OTT_PROVIDER_ALIAS_GROUPS) {
      if (group.includes(id)) {
        for (const aliasId of group) {
          expanded.add(aliasId);
        }
      }
    }
  }
  return expanded;
}
