"use client";

import { usePageSharePayload } from "@/hooks/usePageSharePayload";
import { useShare, type SharePayload } from "@/hooks/useShare";

type ShareButtonProps = {
  payload?: SharePayload;
  className?: string;
};

export function ShareButton({ payload: payloadProp, className }: ShareButtonProps) {
  const payload = usePageSharePayload(payloadProp);
  const { share, status } = useShare();

  const visibleLabel = status === "copied" ? "Copied" : "Share";

  const defaultAriaLabel = payload?.title
    ? `Share ${payload.title.replace(/^Watch\s+/, "")}`
    : "Share this page";

  const ariaLabel =
    status === "copied"
      ? "Link copied"
      : status === "error"
        ? "Could not share"
        : defaultAriaLabel;

  return (
    <div className={`relative shrink-0 ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => share(payload)}
        aria-label={ariaLabel}
        title={ariaLabel}
        className="inline-flex w-fit items-center gap-1.5 rounded-md py-0.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
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
    </div>
  );
}
