const MAX_RETRIES = 5;

function backoffMs(attempt: number): number {
  return 300 * 2 ** attempt;
}

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

      if (response.status === 429 || response.status >= 500) {
        lastError = new Error(`TMDB request failed: ${response.status}`);
      } else {
        throw new Error(`TMDB request failed: ${response.status}`);
      }
    } catch (error) {
      lastError =
        error instanceof Error ? error : new Error("TMDB request failed");

      const httpMatch = lastError.message.match(/^TMDB request failed: (\d+)$/);
      if (httpMatch) {
        const status = Number(httpMatch[1]);
        if (status > 0 && status < 500 && status !== 429) {
          throw lastError;
        }
      }
    }

    if (attempt < MAX_RETRIES - 1) {
      await new Promise((resolve) => setTimeout(resolve, backoffMs(attempt)));
    }
  }

  throw lastError ?? new Error("TMDB request failed");
}
