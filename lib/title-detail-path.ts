export const TITLE_DETAIL_PATH = /^\/(?:movie|tv)\/\d+\/[^/]+$/;

/** `/movie/123` redirect routes and `/movie/123/slug` detail routes. */
export const TITLE_ROUTE_PATH = /^\/(?:movie|tv)\/\d+(?:\/[^/]+)?$/;

export function isTitleDetailPath(pathname: string): boolean {
  return TITLE_DETAIL_PATH.test(pathname);
}

export function isTitleRoutePath(pathname: string): boolean {
  return TITLE_ROUTE_PATH.test(pathname);
}
