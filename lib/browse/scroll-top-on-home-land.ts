const SCROLL_TOP_ON_HOME_LAND_KEY = "ott-dost:scroll-top-on-home-land";

/** Request scroll-to-top when home loads (e.g. cast/crew Link from title page). */
export function requestScrollTopOnHomeLand(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SCROLL_TOP_ON_HOME_LAND_KEY, "1");
  } catch {
    // ignore quota / private mode
  }
}

/** Returns true once per request; clears the flag. */
export function consumeScrollTopOnHomeLand(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (sessionStorage.getItem(SCROLL_TOP_ON_HOME_LAND_KEY) !== "1") {
      return false;
    }
    sessionStorage.removeItem(SCROLL_TOP_ON_HOME_LAND_KEY);
    return true;
  } catch {
    return false;
  }
}
