import { formatStreamOnLabel } from "@/lib/tmdb/utils";

interface StreamOnLabelProps {
  streamOn: string[];
}

export function StreamOnLabel({ streamOn }: StreamOnLabelProps) {
  const label = formatStreamOnLabel(streamOn);
  const isEmpty = streamOn.length === 0;

  return (
    <p
      className={`mt-1 line-clamp-2 text-xs ${isEmpty ? "text-zinc-400" : "text-zinc-500"}`}
    >
      {isEmpty ? label : `Stream on ${label}`}
    </p>
  );
}
