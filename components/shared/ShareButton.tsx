"use client";

import { usePageSharePayload } from "@/hooks/usePageSharePayload";
import { useShare, type SharePayload } from "@/hooks/useShare";
import { isTitleRoutePath } from "@/lib/title-detail-path";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";

type ShareButtonProps = {
  payload?: SharePayload;
  className?: string;
};

export function ShareButton({ payload: payloadProp, className }: ShareButtonProps) {
  const pathname = usePathname();
  const payload = usePageSharePayload(payloadProp);
  const { share, status } = useShare();
  const isPending = status === "pending";
  const isTitleRoute = isTitleRoutePath(pathname);

  // Title pages register share data only after a successful fetch.
  if (isTitleRoute && !payload) {
    return null;
  }

  const visibleLabel =
    status === "pending" ? "Preparing..." : status === "copied" ? "Copied" : "Share";

  const defaultAriaLabel = payload?.title
    ? `Share ${payload.title.replace(/^Watch\s+/, "").replace(/\s*\|\s*OTT Dost$/, "")}`
    : "Share this page";

  const ariaLabel =
    status === "pending"
      ? "Preparing share options"
      : status === "copied"
      ? "Link copied"
      : status === "error"
        ? "Could not share"
        : defaultAriaLabel;

  return (
    <div className={`relative shrink-0 ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => share(payload)}
        disabled={isPending}
        aria-busy={isPending}
        aria-label={ariaLabel}
        title={ariaLabel}
        className="inline-flex w-fit items-center gap-1.5 rounded-md py-0.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 disabled:cursor-wait disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className="h-4 w-4 shrink-0"
        >
          <circle cx="14" cy="5" r="2.25" />
          <circle cx="6" cy="10" r="2.25" />
          <circle cx="14" cy="15" r="2.25" />
          <path d="M8.2 8.8 11.8 6.5" />
          <path d="M8.2 11.2 11.8 13.5" />
        </svg>
        <span aria-live="polite">{visibleLabel}</span>
      </button>
      {isPending && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-zinc-950/20 backdrop-blur-[1px]">
              <div
                className="rounded-xl border border-zinc-200 bg-white/95 px-4 py-3 shadow-lg"
                role="status"
                aria-live="polite"
              >
                <div className="flex items-center gap-2.5 text-sm font-medium text-zinc-700">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700" />
                  <span>Preparing share options...</span>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
