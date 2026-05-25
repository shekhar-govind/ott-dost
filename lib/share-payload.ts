/** Plain-text line divider for share / clipboard messages. */
export const SHARE_TEXT_SEPARATOR = "────────────────";

/** Pipe separator between share headline segments. */
export const SHARE_PIPE = " | ";

export type SharePayload = {
  /** Short headline for the native share sheet preview. */
  title?: string;
  /** Native share subtitle: first overview sentence, clipped with an ellipsis when long. */
  text?: string;
  /** Full formatted body for clipboard copy. */
  clipboardText?: string;
  url?: string;
  /** Same-origin w185 poster URL fetched into Web Share `files` on click. */
  imageUrl?: string;
};
