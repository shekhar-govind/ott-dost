export interface BrowseDiscoveryLink {
  href: string;
  label: string;
}

export const FOOTER_BROWSE_HUB_LINKS: readonly BrowseDiscoveryLink[] = [
  { href: "/movies", label: "Movies" },
  { href: "/tv-shows", label: "TV shows" },
] as const;

/** Curated combo and facet pages for the footer popular row. */
export const FOOTER_BROWSE_POPULAR_LINKS: readonly BrowseDiscoveryLink[] = [
  { href: "/movies/hindi", label: "Hindi movies" },
  { href: "/tv-shows/hindi", label: "Hindi TV shows" },
  { href: "/movies/tamil", label: "Tamil movies" },
  { href: "/movies/english", label: "English movies" },
  { href: "/movies/netflix", label: "Movies on Netflix" },
  { href: "/movies/prime-video", label: "Movies on Prime Video" },
  { href: "/movies/jiohotstar", label: "Movies on JioHotstar" },
  { href: "/movies/hindi/netflix", label: "Hindi movies on Netflix" },
] as const;
