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
  const text = buildNativeShareText(data.title, data.text);
  if (!text) return data;
  return { ...data, text };
}
