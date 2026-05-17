const MAX_RETRIES = 3;

export async function fetchTmdb(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, init);

      if (response.ok) {
        return response;
      }

      if (response.status < 500) {
        throw new Error(`TMDB request failed: ${response.status}`);
      }

      lastError = new Error(`TMDB request failed: ${response.status}`);
    } catch (error) {
      lastError =
        error instanceof Error ? error : new Error("TMDB request failed");
    }

    if (attempt < MAX_RETRIES - 1) {
      await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
    }
  }

  throw lastError ?? new Error("TMDB request failed");
}
