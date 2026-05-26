const nameCache = new Map<number, string>();

/** Use a name already known (e.g. from a title page) before a network lookup. */
export function rememberPersonName(id: number, name: string): void {
  const trimmed = name.trim();
  if (trimmed) nameCache.set(id, trimmed);
}

export function getCachedPersonName(id: number): string | null {
  return nameCache.get(id) ?? null;
}

export async function fetchPersonName(
  id: number,
  signal?: AbortSignal,
): Promise<string> {
  const cached = nameCache.get(id);
  if (cached) return cached;

  const response = await fetch(`/api/person/${id}`, { signal });

  if (!response.ok) {
    throw new Error("Person lookup failed");
  }

  const data = (await response.json()) as { name?: string };
  const name = data.name?.trim();

  if (!name) {
    throw new Error("Person lookup failed");
  }

  nameCache.set(id, name);
  return name;
}
