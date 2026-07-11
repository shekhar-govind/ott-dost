import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  BROWSE_NOINDEX_HEADER,
  shouldNoindexBrowseUrl,
} from "@/lib/browse/browse-seo-policy";
import { resolveBrowseSpecialPathRedirect } from "@/lib/browse/special-page-redirects";
import {
  isBlockedScraperBot,
  isIdOnlyTitlePath,
} from "@/lib/bot-policy";
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

  const { pathname, search } = request.nextUrl;

  const userAgent = request.headers.get("user-agent");
  if (isBlockedScraperBot(userAgent)) {
    return new NextResponse(null, { status: 403 });
  }

  if (isIdOnlyTitlePath(pathname)) {
    return new NextResponse(null, { status: 404 });
  }

  const canonicalSpecialPath = resolveBrowseSpecialPathRedirect(pathname);
  if (canonicalSpecialPath) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = canonicalSpecialPath;
    return NextResponse.redirect(redirectUrl, 301);
  }

  if (shouldNoindexBrowseUrl(pathname, search)) {
    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", BROWSE_NOINDEX_HEADER);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Page routes only — API handlers skip middleware (host redirect, noindex,
    // canonical redirects are irrelevant for /api/*; robots.txt disallows them).
    "/((?!api/|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
