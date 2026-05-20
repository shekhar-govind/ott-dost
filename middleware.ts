import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Internal design previews — not for public production traffic. */
export function middleware(request: NextRequest) {
  if (process.env.NODE_ENV !== "production") {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith("/design")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/design/:path*",
};
