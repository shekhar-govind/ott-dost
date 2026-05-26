/**
 * Standalone back-navigation detection (history traverse backward).
 * Does not integrate with scroll restoration or routing — subscribe only.
 */

const HISTORY_IDX_KEY = "ottDostHistoryIdx";
const PATCHED_KEY = Symbol.for("ott-dost:history-patched");

export interface BackNavigationLandEvent {
  viaBack: true;
  route: string;
  historyIndex: number;
  detectedBy: "history-index" | "navigation-api" | "navigation-entry-index";
}

type BackNavigationListener = (event: BackNavigationLandEvent) => void;

let currentHistoryIndex = 0;
let lastNavigationEntryIndex = 0;
let pendingBackLand = false;
let pendingDetectedBy: BackNavigationLandEvent["detectedBy"] = "history-index";
let initialized = false;
let listener: BackNavigationListener | null = null;

let originalPushState: History["pushState"] | null = null;
let originalReplaceState: History["replaceState"] | null = null;

interface NavigationApiNavigateEvent extends Event {
  navigationType?: string;
  direction?: string;
}

interface NavigationApiEntry {
  index?: number;
  url?: string;
}

interface NavigationApi {
  currentEntry?: NavigationApiEntry | null;
  addEventListener(
    type: "navigate" | "navigatesuccess",
    listener: (event: NavigationApiNavigateEvent) => void,
  ): void;
  removeEventListener(
    type: "navigate" | "navigatesuccess",
    listener: (event: NavigationApiNavigateEvent) => void,
  ): void;
}

function getNavigationApi(): NavigationApi | null {
  if (typeof window === "undefined") return null;
  return (window as Window & { navigation?: NavigationApi }).navigation ?? null;
}

function readIndexFromState(state: unknown): number | null {
  if (!state || typeof state !== "object") return null;
  const idx = (state as Record<string, unknown>)[HISTORY_IDX_KEY];
  return typeof idx === "number" && Number.isFinite(idx) ? idx : null;
}

function routeFromLocation(): string {
  if (typeof window === "undefined") return "/";
  return window.location.pathname + window.location.search;
}

function syncNavigationEntryIndex(): void {
  const entryIndex = getNavigationApi()?.currentEntry?.index;
  if (entryIndex != null && Number.isFinite(entryIndex)) {
    lastNavigationEntryIndex = entryIndex;
  }
}

function markPendingBack(detectedBy: BackNavigationLandEvent["detectedBy"]): void {
  pendingBackLand = true;
  pendingDetectedBy = detectedBy;
}

function emitBackLand(route: string): void {
  if (!listener) return;

  listener({
    viaBack: true,
    route,
    historyIndex: currentHistoryIndex,
    detectedBy: pendingDetectedBy,
  });
}

function flushPendingBackLand(route?: string): void {
  if (!pendingBackLand) return;

  const resolvedRoute = route ?? routeFromLocation();
  pendingBackLand = false;
  emitBackLand(resolvedRoute);
}

function detectBackFromPopState(event: PopStateEvent): BackNavigationLandEvent["detectedBy"] | null {
  const stateIndex = readIndexFromState(event.state);
  if (stateIndex != null && stateIndex < currentHistoryIndex) {
    return "history-index";
  }

  const entryIndex = getNavigationApi()?.currentEntry?.index;
  if (entryIndex != null && entryIndex < lastNavigationEntryIndex) {
    return "navigation-entry-index";
  }

  if (pendingBackLand && pendingDetectedBy === "navigation-api") {
    return "navigation-api";
  }

  return null;
}

function onPopState(event: PopStateEvent): void {
  const detectedBy = detectBackFromPopState(event);

  const stateIndex = readIndexFromState(event.state);
  if (stateIndex != null) {
    currentHistoryIndex = stateIndex;
  }

  const entryIndex = getNavigationApi()?.currentEntry?.index;
  if (entryIndex != null) {
    currentHistoryIndex = entryIndex;
    lastNavigationEntryIndex = entryIndex;
  }

  if (detectedBy) {
    markPendingBack(detectedBy);
    queueMicrotask(() => flushPendingBackLand());
    queueMicrotask(() => {
      requestAnimationFrame(() => flushPendingBackLand());
    });
  }
}

function onNavigate(event: NavigationApiNavigateEvent): void {
  if (event.navigationType !== "traverse") return;
  if (event.direction !== "back") return;
  markPendingBack("navigation-api");
}

function onNavigateSuccess(): void {
  const entryIndex = getNavigationApi()?.currentEntry?.index;
  if (entryIndex == null) return;

  if (entryIndex < lastNavigationEntryIndex) {
    markPendingBack("navigation-entry-index");
    queueMicrotask(() => flushPendingBackLand());
  }

  lastNavigationEntryIndex = entryIndex;
  currentHistoryIndex = entryIndex;
}

function patchHistoryMethods(): void {
  if (typeof window === "undefined") return;
  const historyRef = window.history as History & { [PATCHED_KEY]?: boolean };
  if (historyRef[PATCHED_KEY]) return;

  originalPushState = historyRef.pushState.bind(historyRef);
  originalReplaceState = historyRef.replaceState.bind(historyRef);

  historyRef.pushState = function patchedPushState(
    state: unknown,
    unused: string,
    url?: string | URL | null,
  ) {
    currentHistoryIndex += 1;
    const nextState =
      state && typeof state === "object"
        ? { ...(state as object), [HISTORY_IDX_KEY]: currentHistoryIndex }
        : { [HISTORY_IDX_KEY]: currentHistoryIndex };
    const result = originalPushState!(nextState, unused, url);
    syncNavigationEntryIndex();
    return result;
  };

  historyRef.replaceState = function patchedReplaceState(
    state: unknown,
    unused: string,
    url?: string | URL | null,
  ) {
    const nextState =
      state && typeof state === "object"
        ? { ...(state as object), [HISTORY_IDX_KEY]: currentHistoryIndex }
        : { [HISTORY_IDX_KEY]: currentHistoryIndex };
    const result = originalReplaceState!(nextState, unused, url);
    syncNavigationEntryIndex();
    return result;
  };

  historyRef[PATCHED_KEY] = true;
}

function seedCurrentHistoryIndex(): void {
  const fromState = readIndexFromState(window.history.state);
  if (fromState != null) {
    currentHistoryIndex = fromState;
  } else {
    originalReplaceState!(
      {
        ...(window.history.state && typeof window.history.state === "object"
          ? window.history.state
          : {}),
        [HISTORY_IDX_KEY]: 0,
      },
      "",
    );
    currentHistoryIndex = 0;
  }

  syncNavigationEntryIndex();
  const entryIndex = getNavigationApi()?.currentEntry?.index;
  if (entryIndex != null) {
    lastNavigationEntryIndex = entryIndex;
    currentHistoryIndex = entryIndex;
  }
}

/**
 * Start listening for back navigations. Idempotent.
 * Returns a cleanup function (listeners stay for app lifetime).
 */
export function initBackNavigationDetection(
  onLandedViaBack?: BackNavigationListener,
): () => void {
  if (typeof window === "undefined") return () => {};

  if (onLandedViaBack) {
    listener = onLandedViaBack;
  }

  if (initialized) {
    return () => {};
  }

  initialized = true;

  patchHistoryMethods();
  seedCurrentHistoryIndex();

  window.addEventListener("popstate", onPopState);

  const navigationApi = getNavigationApi();
  if (navigationApi) {
    navigationApi.addEventListener("navigate", onNavigate);
    navigationApi.addEventListener("navigatesuccess", onNavigateSuccess);
  }

  return () => {
    if (onLandedViaBack) {
      listener = null;
    }
  };
}

/** Whether a back navigation is pending until the route has settled. */
export function hasPendingBackNavigation(): boolean {
  return pendingBackLand;
}

/**
 * Call after the app route has settled (e.g. pathname/search updated).
 * Emits the listener once if this land was caused by back.
 */
export function notifyRouteSettled(route?: string): void {
  flushPendingBackLand(route);
}

export const BACK_NAVIGATION_LOG_PREFIX = "[ott-dost:navigation]";
