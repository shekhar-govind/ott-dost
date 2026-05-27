import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  isAlternateProductionHost,
  isPreviewOrLocalHost,
  PRIMARY_SITE_HOST,
} from "@/lib/site-url";

function requestHost(request: NextRequest): string | undefined {
  const raw = request.headers.get("host") ?? request.nextUrl.host;
  return raw.split(":")[0]?.toLowerCase();
}

/** Internal design previews — not for public production traffic. */
export function middleware(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    const host = requestHost(request);
    if (
      host &&
      !isPreviewOrLocalHost(host) &&
      isAlternateProductionHost(host)
    ) {
      const url = request.nextUrl.clone();
      url.protocol = "https:";
      url.host = PRIMARY_SITE_HOST;
      return NextResponse.redirect(url, 308);
    }

    if (request.nextUrl.pathname.startsWith("/design")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
