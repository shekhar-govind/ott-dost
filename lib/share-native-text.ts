import { SHARE_BRAND_SUFFIX } from "@/lib/share-brand";

/** Title-page share text already includes the full headline block. */
export const TITLE_SHARE_TEXT_MARKER = SHARE_BRAND_SUFFIX;

export function isCompleteTitleShareText(text: string | undefined): boolean {
  return Boolean(text?.includes(TITLE_SHARE_TEXT_MARKER));
}

/**
 * Web Share targets on Android, iOS, and desktop often ignore ShareData.title.
 * Put the headline in ShareData.text so the preview and message body show it.
 */
export function buildNativeShareText(
  title: string | undefined,
  body: string | undefined,
): string | undefined {
  const headline = title?.trim();
  const detail = body?.trim();

  if (!headline) return detail;
  if (!detail) return headline;
  if (detail.startsWith(headline)) return detail;

  return `${headline}\n\n${detail}`;
}

/** Apply {@link buildNativeShareText} to Web Share data (keeps title for email subjects). */
export function withNativeShareText(data: ShareData): ShareData {
  if (isCompleteTitleShareText(data.text)) return data;
  const text = buildNativeShareText(data.title, data.text);
  if (!text) return data;
  return { ...data, text };
}
