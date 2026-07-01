import { SITE_TAGLINE } from "@/lib/watch-region";

const LOGO_SRC = "/ott-dost-logo.png";

type SiteLogoProps = {
  size?: "header" | "footer";
};

export function SiteLogo({ size = "header" }: SiteLogoProps) {
  const isHeader = size === "header";
  const imgClass = isHeader
    ? "h-9 w-9 sm:h-10 sm:w-10"
    : "h-8 w-8";
  const titleClass = isHeader
    ? "text-base font-semibold tracking-tight sm:text-lg"
    : "text-sm font-semibold tracking-tight";
  const lockupGap = "gap-0";

  return (
    <div
      className={
        isHeader
          ? "flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3"
          : "space-y-1.5"
      }
    >
      <a
        href="/"
        className={`inline-flex min-w-0 items-center ${lockupGap} transition hover:opacity-80 ${isHeader ? "group" : ""}`}
      >
        <img
          src={LOGO_SRC}
          alt=""
          width={isHeader ? 40 : 32}
          height={isHeader ? 40 : 32}
          className={`shrink-0 rounded-lg object-contain ${imgClass}`}
        />
        <span
          className={`text-zinc-900 transition group-hover:text-zinc-600 ${titleClass}`}
        >
          OTT Dost
        </span>
      </a>
      {!isHeader ? (
        <p className="max-w-xs text-pretty text-xs leading-relaxed text-zinc-500">
          {SITE_TAGLINE}
        </p>
      ) : null}
    </div>
  );
}
