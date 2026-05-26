import type { BrowseMediaType } from "./filters";

export function buildBrowseCastUrl(
  mediaType: BrowseMediaType,
  personId: number,
): string {
  const params = new URLSearchParams();
  params.set("type", mediaType);
  params.set("cast", String(personId));
  return `/?${params.toString()}`;
}

export function buildBrowseCrewUrl(
  mediaType: BrowseMediaType,
  personId: number,
): string {
  const params = new URLSearchParams();
  params.set("type", mediaType);
  params.set("crew", String(personId));
  return `/?${params.toString()}`;
}
