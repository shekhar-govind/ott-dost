/** Plain-text line divider for share / clipboard messages. */
export const SHARE_TEXT_SEPARATOR = "────────────────";

export type SharePayload = {
  /** Short headline for the native share sheet preview. */
  title?: string;
  /** Compact subtitle for the share sheet (keep brief; no heavy separators). */
  text?: string;
  /** Full formatted body for clipboard copy. */
  clipboardText?: string;
  url?: string;
  imageUrl?: string;
};
