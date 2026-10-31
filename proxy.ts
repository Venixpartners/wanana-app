import { NextResponse, type NextRequest } from "next/server";
import { refreshSession } from "@/lib/supabase/proxy-session";
import { gateFor } from "@/lib/launch-gate";
import { launchMode } from "@/lib/site";

export async function proxy(request: NextRequest) {
  const { supabase, userId, response } = await refreshSession(request, NextResponse.next({ request }));

  // While Wanana is in coming soon mode, the public sees the home page only. Admins can use the whole site.
  if (launchMode() === "coming_soon" && gateFor(request.nextUrl.pathname) === "admin_only") {
    let isAdmin = false;
    if (userId) {
      const { data } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
      isAdmin = data?.role === "admin";
    }
    if (!isAdmin) {
      const redirect = NextResponse.redirect(new URL("/", request.url));
      response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
      return redirect;
    }
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|icon.svg|apple-icon|favicon.ico|robots.txt|sitemap.xml).*)"],
};
