import { buildTitleSharePayload } from "@/lib/build-title-share-payload";
import type { TitleDetail } from "@/lib/tmdb/types";

export function TitleShareData({ detail }: { detail: TitleDetail }) {
  const payload = buildTitleSharePayload(detail);
  const json = JSON.stringify(payload).replace(/</g, "\\u003c");

  return (
    <script
      id="ott-dost-title-share"
      type="application/json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
