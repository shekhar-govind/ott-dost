import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^TMDB_API_KEY=(.+)$/);
      if (m) process.env.TMDB_API_KEY = m[1].replace(/^["']|["']$/g, "");
    }
  } catch {
    /* optional */
  }
}

loadEnvLocal();

const key = process.env.TMDB_API_KEY;
if (!key) {
  console.error("TMDB_API_KEY missing");
  process.exit(1);
}

async function fetchList(endpoint) {
  const url = `https://api.themoviedb.org/3/watch/providers/${endpoint}?api_key=${key}&watch_region=IN`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results ?? [];
}

function normKey(name) {
  return name
    .toLowerCase()
    .replace(/\s+with ads$/i, "")
    .replace(/\s+amazon channel$/i, "")
    .replace(/\s+channel$/i, "")
    .replace(/^amazon\s+/i, "")
    .trim();
}

const [movie, tv] = await Promise.all([fetchList("movie"), fetchList("tv")]);
const combined = [
  ...movie.map((p) => ({ ...p, source: "movie" })),
  ...tv.map((p) => ({ ...p, source: "tv" })),
];

const catalog = new Map();
for (const p of combined) {
  if (!catalog.has(p.provider_id)) {
    catalog.set(p.provider_id, p.provider_name);
  }
}

const byName = new Map();
for (const [id, name] of catalog) {
  if (!byName.has(name)) byName.set(name, []);
  byName.get(name).push(id);
}

const byNorm = new Map();
for (const [id, name] of catalog) {
  const k = normKey(name);
  if (!byNorm.has(k)) byNorm.set(k, []);
  byNorm.get(k).push({ id, name });
}

const idInBothLists = [...catalog.keys()].filter((id) => {
  const inMovie = movie.some((p) => p.provider_id === id);
  const inTv = tv.some((p) => p.provider_id === id);
  return inMovie && inTv;
});

let meta = { providers: [] };
try {
  const metaRes = await fetch("http://localhost:3000/api/browse/meta");
  meta = await metaRes.json();
} catch {
  /* dev server optional */
}

// Keep in sync with lib/browse/ott-platform-normalization.ts
const aliasGroups = [
  [2336, 122],
  [119, 2100],
  [8, 175],
];

const report = {
  stats: {
    tmdbMovieRows: movie.length,
    tmdbTvRows: tv.length,
    uniqueProviderIds: catalog.size,
    idsInBothMovieAndTvLists: idInBothLists.length,
    exactNameWithMultipleIds: [...byName.values()].filter((ids) => ids.length > 1).length,
    heuristicNormGroupsWithMultipleIds: [...byNorm.values()].filter(
      (items) => new Set(items.map((i) => i.id)).size > 1,
    ).length,
    metaProviderCount: meta.providers?.length ?? 0,
  },
  manualAliasGroups: aliasGroups.map((ids) => ({
    canonicalId: ids[0],
    ids,
    names: ids.map((id) => catalog.get(id) ?? "(not in IN catalog)"),
  })),
  exactNameMultipleIds: [...byName.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([name, ids]) => ({ name, ids: ids.sort((a, b) => a - b) }))
    .sort((a, b) => a.name.localeCompare(b.name)),
  heuristicNormGroups: [...byNorm.entries()]
    .filter(([, items]) => new Set(items.map((i) => i.id)).size > 1)
    .map(([normKey, items]) => ({
      normKey,
      entries: [...new Map(items.map((i) => [i.id, i])).values()].sort(
        (a, b) => a.name.localeCompare(b.name),
      ),
    }))
    .sort((a, b) => a.normKey.localeCompare(b.normKey)),
  metaProviders: (meta.providers ?? [])
    .map((p) => ({ name: p.name, id: p.id, ids: [p.id] }))
    .sort((a, b) => a.name.localeCompare(b.name)),
};

console.log(JSON.stringify(report, null, 2));
