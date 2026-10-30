import { NextResponse, type NextRequest } from "next/server";
import { refreshSession } from "@/lib/supabase/proxy-session";
import { launchMode } from "@/lib/site";

// While Wanana is in coming soon mode, only these paths are reachable.
const OPEN_PATHS = new Set(["/", "/privacy"]);

export async function proxy(request: NextRequest) {
  if (launchMode() === "coming_soon" && !OPEN_PATHS.has(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return refreshSession(request, NextResponse.next({ request }));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|icon.svg|apple-icon|favicon.ico|robots.txt|sitemap.xml).*)"],
};
