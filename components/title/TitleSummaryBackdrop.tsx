interface TitleSummaryBackdropProps {
  backdropUrl: string;
  title: string;
}

export function TitleSummaryBackdrop({
  backdropUrl,
  title,
}: TitleSummaryBackdropProps) {
  return (
    <div className="relative h-36 w-full sm:h-44">
      <img
        src={backdropUrl}
        alt=""
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover object-[center_8%] saturate-[1.05]"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white from-0% via-white/70 via-30% to-transparent to-65%"
        aria-hidden
      />
      <span className="sr-only">{title} backdrop</span>
    </div>
  );
}
