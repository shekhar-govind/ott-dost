import { SiteLogo } from "./SiteLogo";

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 bg-zinc-50/80 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6 sm:py-5">
        <h1 className="min-w-0">
          <SiteLogo size="header" showTagline />
        </h1>
      </div>
    </header>
  );
}
