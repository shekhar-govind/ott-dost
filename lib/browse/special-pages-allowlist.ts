import type { BrowseMediaType } from "./filters";
import {
  LAUNCH_BROWSE_LANGUAGE_SLUGS,
  LAUNCH_BROWSE_PROVIDER_SLUGS,
} from "./slug-registry";

export interface BrowseSpecialPagePath {
  mediaType: BrowseMediaType;
  segments: string[];
  pathname: string;
}

function buildPath(mediaType: BrowseMediaType, segments: string[]): string {
  const namespace = mediaType === "tv" ? "tv-shows" : "movies";
  if (segments.length === 0) return `/${namespace}`;
  return `/${namespace}/${segments.join("/")}`;
}

/**
 * Launch allowlist paths for ISR special pages (~154 URLs).
 * Genres are intentionally omitted until a later stage.
 */
export function listLaunchBrowseSpecialPagePaths(): BrowseSpecialPagePath[] {
  const paths: BrowseSpecialPagePath[] = [];
  const mediaTypes: BrowseMediaType[] = ["movie", "tv"];

  for (const mediaType of mediaTypes) {
    paths.push({ mediaType, segments: [], pathname: buildPath(mediaType, []) });

    for (const languageSlug of LAUNCH_BROWSE_LANGUAGE_SLUGS) {
      paths.push({
        mediaType,
        segments: [languageSlug],
        pathname: buildPath(mediaType, [languageSlug]),
      });
    }

    for (const providerSlug of LAUNCH_BROWSE_PROVIDER_SLUGS) {
      paths.push({
        mediaType,
        segments: [providerSlug],
        pathname: buildPath(mediaType, [providerSlug]),
      });
    }

    for (const languageSlug of LAUNCH_BROWSE_LANGUAGE_SLUGS) {
      for (const providerSlug of LAUNCH_BROWSE_PROVIDER_SLUGS) {
        paths.push({
          mediaType,
          segments: [languageSlug, providerSlug],
          pathname: buildPath(mediaType, [languageSlug, providerSlug]),
        });
      }
    }
  }

  return paths;
}
