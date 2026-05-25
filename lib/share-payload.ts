/** Plain-text line divider for share / clipboard messages. */
export const SHARE_TEXT_SEPARATOR = "────────────────";

export type SharePayload = {
  title?: string;
  text?: string;
  url?: string;
  imageUrl?: string;
};
