"use client";

import {
  fetchPersonName,
  getCachedPersonName,
} from "@/lib/api/person";
import type { BrowseFilters } from "@/lib/browse/filters";
import { useEffect, useState } from "react";

export type BrowsePersonChipLabel =
  | { status: "loading" }
  | { status: "ready"; label: string };

export interface BrowsePersonFilterChipLabels {
  cast: BrowsePersonChipLabel | null;
  crew: BrowsePersonChipLabel | null;
}

function labelsFromCache(
  castId: number | null,
  crewId: number | null,
): BrowsePersonFilterChipLabels {
  const castName = castId ? getCachedPersonName(castId) : null;
  const crewName = crewId ? getCachedPersonName(crewId) : null;

  return {
    cast: castId
      ? castName
        ? { status: "ready", label: castName }
        : { status: "loading" }
      : null,
    crew: crewId
      ? crewName
        ? { status: "ready", label: crewName }
        : { status: "loading" }
      : null,
  };
}

export function useBrowsePersonFilterNames(
  filters: BrowseFilters,
): BrowsePersonFilterChipLabels {
  const [labels, setLabels] = useState<BrowsePersonFilterChipLabels>(() =>
    labelsFromCache(filters.castPersonId, filters.crewPersonId),
  );

  useEffect(() => {
    const castId = filters.castPersonId;
    const crewId = filters.crewPersonId;

    if (!castId && !crewId) {
      setLabels({ cast: null, crew: null });
      return;
    }

    const cached = labelsFromCache(castId, crewId);
    setLabels(cached);

    const needsCast = cached.cast?.status === "loading";
    const needsCrew = cached.crew?.status === "loading";
    if (!needsCast && !needsCrew) return;

    const controller = new AbortController();

    async function load() {
      try {
        if (castId && crewId && castId === crewId) {
          const name = await fetchPersonName(castId, controller.signal);
          if (!controller.signal.aborted) {
            setLabels({
              cast: { status: "ready", label: name },
              crew: { status: "ready", label: name },
            });
          }
          return;
        }

        const [castName, crewName] = await Promise.all([
          needsCast && castId
            ? fetchPersonName(castId, controller.signal)
            : Promise.resolve(null),
          needsCrew && crewId
            ? fetchPersonName(crewId, controller.signal)
            : Promise.resolve(null),
        ]);

        if (!controller.signal.aborted) {
          setLabels({
            cast: castId
              ? {
                  status: "ready",
                  label: castName ?? String(castId),
                }
              : null,
            crew: crewId
              ? {
                  status: "ready",
                  label: crewName ?? String(crewId),
                }
              : null,
          });
        }
      } catch {
        if (!controller.signal.aborted) {
          setLabels({
            cast: castId ? { status: "ready", label: String(castId) } : null,
            crew: crewId ? { status: "ready", label: String(crewId) } : null,
          });
        }
      }
    }

    void load();

    return () => controller.abort();
  }, [filters.castPersonId, filters.crewPersonId]);

  return labels;
}
