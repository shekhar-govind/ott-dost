import { lookupBrowseSlug } from "./slug-registry";

const PROVIDER_DISPLAY_NAMES: Readonly<Record<string, string>> = {
  netflix: "Netflix",
  "prime-video": "Prime Video",
  jiohotstar: "JioHotstar",
  zee5: "ZEE5",
  sonyliv: "SonyLIV",
  mxplayer: "MX Player",
};

function languageRomanName(code: string): string {
  try {
    return (
      new Intl.DisplayNames(["en"], { type: "language" }).of(code) ??
      code.toUpperCase()
    );
  } catch {
    return code.toUpperCase();
  }
}

export function browseSlugDisplayName(slug: string): string | null {
  const entry = lookupBrowseSlug(slug);
  if (!entry) return null;

  if (entry.facet === "language") {
    return languageRomanName(entry.languageCode);
  }

  if (entry.facet === "provider") {
    return PROVIDER_DISPLAY_NAMES[entry.slug] ?? entry.slug;
  }

  return entry.slug;
}
