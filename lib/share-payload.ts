/** Plain-text line divider for share / clipboard messages. */
export const SHARE_TEXT_SEPARATOR = "────────────────";

/** Pipe separator between share headline segments. */
export const SHARE_PIPE = " | ";

export type SharePayload = {
  /**
   * Headline (e.g. "Watch {title} | OTT Dost"). Kept for targets that map it
   * (e.g. email subject); also prepended to `text` at share time for Android/iOS/web.
   */
  title?: string;
  /**
   * Native share body, e.g. "{title} ({year}) - where to watch in India | OTT Dost",
   * "---", then first overview sentence.
   */
  text?: string;
  /** Full formatted body for clipboard copy. */
  clipboardText?: string;
  url?: string;
  /** Same-origin w185 poster URL fetched into Web Share `files` on click. */
  imageUrl?: string;
};
