const PREFIX = "[browse-debug]";

function isBrowseDebugEnabled(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  if (typeof window === "undefined") {
    return process.env.BROWSE_DEBUG === "true";
  }
  return process.env.NEXT_PUBLIC_BROWSE_DEBUG === "true";
}

export function browseDebug(label: string, data?: unknown): void {
  if (!isBrowseDebugEnabled()) return;

  if (data === undefined) {
    console.debug(`${PREFIX} ${label}`);
    return;
  }
  console.debug(`${PREFIX} ${label}`, data);
}

