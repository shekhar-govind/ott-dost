import { ShareButton } from "@/components/shared/ShareButton";
import { SiteLogo } from "./SiteLogo";

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 bg-zinc-50 lg:bg-zinc-50/80 lg:backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-3xl items-start justify-between gap-3 px-4 py-4 sm:items-center sm:px-6 sm:py-5">
        <h1 className="min-w-0">
          <SiteLogo size="header" showTagline />
        </h1>
        <ShareButton className="mt-0.5 sm:mt-0" />
      </div>
    </header>
  );
}
