import type { WatchAvailability, WatchStreamSource } from "@/lib/tmdb/types";
import { hasWatchAvailability } from "@/lib/tmdb/utils";
import { NO_OTT_MESSAGE } from "@/lib/watch-region";

export { NO_OTT_MESSAGE };

export function getStreamGroupLabel(
  streamSource: WatchStreamSource | undefined,
): string {
  return streamSource === "network" ? "Expected on" : "Streaming on";
}

export const NO_SUBSCRIPTION_STREAM_MESSAGE =
  "Not available to stream on subscription platforms.";

/** Matches {@link TitleSummaryProviders} when subscription streaming is empty. */
export function getStreamUnavailableMessage(
  availability: Pick<WatchAvailability, "stream" | "rent" | "buy">,
): string {
  if (!hasWatchAvailability(availability)) {
    return NO_OTT_MESSAGE;
  }
  return NO_SUBSCRIPTION_STREAM_MESSAGE;
}

export function hasRentOrBuyAvailability(
  availability: Pick<WatchAvailability, "rent" | "buy">,
): boolean {
  return availability.rent.length > 0 || availability.buy.length > 0;
}

/** When subscription streaming is empty but rent/buy may still exist. */
export function getStreamUnavailableMessageForEmptyStream(
  hasRentOrBuy: boolean,
): string {
  return hasRentOrBuy
    ? NO_SUBSCRIPTION_STREAM_MESSAGE
    : NO_OTT_MESSAGE;
}
