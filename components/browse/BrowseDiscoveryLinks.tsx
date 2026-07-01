import type { BrowseDiscoveryLink } from "@/lib/browse/special-page-discovery-links";

interface BrowseDiscoveryLinksProps {
  links: readonly BrowseDiscoveryLink[];
  title?: string;
}

export function BrowseDiscoveryLinks({
  links,
  title = "Browse by language or platform",
}: BrowseDiscoveryLinksProps) {
  if (links.length === 0) return null;

  return (
    <nav
      data-home-browse-discovery
      className="mb-2 w-full"
      aria-label={title}
    >
      <p className="mb-2 text-xs font-medium tracking-wide text-zinc-500 uppercase">
        {title}
      </p>
      <ul className="flex flex-wrap gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="inline-flex rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
