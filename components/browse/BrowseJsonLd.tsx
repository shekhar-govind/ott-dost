import { buildBrowsePageTitle } from "@/lib/browse/browse-page-metadata";
import type { BrowseFilters } from "@/lib/browse/filters";
import { getSiteBaseUrl } from "@/lib/site-url";
import { titlePathFromSearchTitle } from "@/lib/title-url";
import type { SearchTitle } from "@/lib/tmdb/types";

interface BrowseJsonLdProps {
  filters: BrowseFilters;
  items: SearchTitle[];
}

interface ItemListJsonLd {
  "@context": "https://schema.org";
  "@type": "ItemList";
  name: string;
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    url: string;
    name: string;
  }>;
}

export function BrowseJsonLd({ filters, items }: BrowseJsonLdProps) {
  if (items.length === 0) return null;

  const baseUrl = getSiteBaseUrl();
  const listName = buildBrowsePageTitle(filters).replace(/ \| OTT Dost$/, "");

  const jsonLd: ItemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    itemListElement: items.map((item, index) => {
      const path = titlePathFromSearchTitle(item);
      return {
        "@type": "ListItem",
        position: index + 1,
        url: baseUrl ? `${baseUrl}${path}` : path,
        name: item.title,
      };
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
