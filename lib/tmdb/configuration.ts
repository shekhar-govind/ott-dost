import { TMDB_API_BASE } from "./constants";
import { fetchTmdb } from "./fetch";
import { getTmdbApiKey } from "./utils";

export interface TmdbConfigurationLanguage {
  iso_639_1: string;
  english_name: string;
  name: string;
}

export async function getTmdbConfigurationLanguages(): Promise<
  TmdbConfigurationLanguage[]
> {
  const params = new URLSearchParams({ api_key: getTmdbApiKey() });
  const response = await fetchTmdb(
    `${TMDB_API_BASE}/configuration/languages?${params}`,
    { next: { revalidate: 86_400 } },
  );

  const data = (await response.json()) as TmdbConfigurationLanguage[];
  return Array.isArray(data) ? data : [];
}
