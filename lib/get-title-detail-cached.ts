import { cache } from "react";
import { getTitleDetails } from "@/lib/tmdb/client";
import type { TitleDetail, TmdbMediaType } from "@/lib/tmdb/types";
import { toTitleDetailFromMovie, toTitleDetailFromTv } from "@/lib/tmdb/utils";

export const getTitleDetailCached = cache(
  async (mediaType: TmdbMediaType, id: number): Promise<TitleDetail | null> => {
    if (!Number.isInteger(id) || id <= 0) return null;

    try {
      const raw = await getTitleDetails(mediaType, id);
      return mediaType === "movie"
        ? toTitleDetailFromMovie(
            raw as Parameters<typeof toTitleDetailFromMovie>[0],
          )
        : toTitleDetailFromTv(raw as Parameters<typeof toTitleDetailFromTv>[0]);
    } catch {
      return null;
    }
  },
);
