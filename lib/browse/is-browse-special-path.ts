/** True for `/movies`, `/movies/…`, `/tv-shows`, `/tv-shows/…`. */
export function isBrowseSpecialPathname(pathname: string): boolean {
  return (
    pathname === "/movies" ||
    pathname.startsWith("/movies/") ||
    pathname === "/tv-shows" ||
    pathname.startsWith("/tv-shows/")
  );
}
