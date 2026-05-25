/** Plain-text line divider for share / clipboard messages. */
export const SHARE_TEXT_SEPARATOR = "────────────────";

/** Pipe separator between share headline segments. */
export const SHARE_PIPE = " | ";

export type SharePayload = {
  /** Short headline for the native share sheet preview. */
  title?: string;
  /** Compact subtitle for the share sheet, e.g. "Watch {title} | OTT Dost". */
  text?: string;
  /** Full formatted body for clipboard copy. */
  clipboardText?: string;
  url?: string;
};
