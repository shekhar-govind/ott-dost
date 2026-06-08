export const TITLE_DETAIL_PATH = /^\/(?:movie|tv)\/\d+\/[^/]+$/;

export function isTitleDetailPath(pathname: string): boolean {
  return TITLE_DETAIL_PATH.test(pathname);
}
