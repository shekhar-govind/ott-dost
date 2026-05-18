import type { NextRequest } from "next/server";
import { parseBrowseFilters, type BrowseFilters } from "./filters";

export function parseBrowseFiltersFromRequest(request: NextRequest): BrowseFilters {
  return parseBrowseFilters(request.nextUrl.searchParams);
}
