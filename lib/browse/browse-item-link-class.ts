/** Shared browse row link surface (server + client list items). */
export const BROWSE_ITEM_LINK_CLASS =
  "relative flex w-full min-h-14 touch-manipulation items-start gap-2.5 rounded-lg border border-zinc-100 bg-white px-2.5 py-2 text-left shadow-none outline-none transition-[border-color,background-color,box-shadow,opacity,transform] duration-200 ease-out sm:shadow-[0_1px_2px_rgba(0,0,0,0.04)] " +
  "hover:border-zinc-200/90 hover:bg-zinc-50/70 active:bg-zinc-50 active:scale-[0.992] motion-reduce:transition-none motion-reduce:active:scale-100 " +
  "focus-visible:ring-2 focus-visible:ring-zinc-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 " +
  "sm:min-h-0 sm:gap-3 sm:px-3 sm:py-2.5 " +
  "[&:has([data-nav-pending])]:border-violet-200/90 [&:has([data-nav-pending])]:bg-gradient-to-br [&:has([data-nav-pending])]:from-violet-50/90 [&:has([data-nav-pending])]:to-white " +
  "[&:has([data-nav-pending])]:shadow-[0_2px_14px_rgba(109,40,217,0.09)]";
