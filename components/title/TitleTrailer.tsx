"use client";

import { useState } from "react";
import type { TitleTrailer as TitleTrailerData } from "@/lib/tmdb/types";

interface TitleTrailerProps {
  trailer: TitleTrailerData;
}

function buildEmbedUrl(youtubeKey: string): string {
  const params = new URLSearchParams({
    autoplay: "1",
    rel: "0",
    modestbranding: "1",
  });
  return `https://www.youtube-nocookie.com/embed/${youtubeKey}?${params}`;
}

export function TitleTrailer({ trailer }: TitleTrailerProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <article className="mt-3 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-none sm:shadow-sm">
      <div className="p-4 sm:p-6">
        <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Trailer
        </h2>

        <div className="relative mt-3 aspect-video overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
          {playing ? (
            <iframe
              src={buildEmbedUrl(trailer.youtubeKey)}
              title={trailer.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="group absolute inset-0 block h-full w-full cursor-pointer text-left"
              aria-label={`Play ${trailer.name}`}
            >
              <img
                src={trailer.thumbnailUrl}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
              <span
                className="absolute inset-0 flex items-center justify-center bg-zinc-900/25 transition group-hover:bg-zinc-900/35 motion-reduce:transition-none"
                aria-hidden
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
                  Play
                </span>
              </span>
              <span className="absolute bottom-2 left-2 rounded bg-white/95 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-900">
                YouTube
              </span>
            </button>
          )}
        </div>

        <p className="mt-3 text-sm font-medium text-zinc-900">{trailer.name}</p>
        <p className="mt-0.5 text-xs text-zinc-500">
          {playing ? (
            <>
              Playing on this page.{" "}
              <button
                type="button"
                onClick={() => setPlaying(false)}
                className="font-medium text-zinc-700 underline underline-offset-2 hover:text-zinc-900"
              >
                Close player
              </button>
              {" · "}
              <a
                href={trailer.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-zinc-700 underline underline-offset-2 hover:text-zinc-900"
              >
                Open on YouTube
              </a>
            </>
          ) : (
            <>
              Tap Play to watch here.{" "}
              <a
                href={trailer.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-zinc-700 underline underline-offset-2 hover:text-zinc-900"
              >
                Open on YouTube
              </a>
            </>
          )}
        </p>
      </div>
    </article>
  );
}
