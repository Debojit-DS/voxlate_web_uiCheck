import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import { withCors, withSecurityHeaders } from "@/lib/cors";
import { validateStartup } from "@/lib/startupValidation";

validateStartup();

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Handle CORS preflight for all API routes
  if (pathname.startsWith("/api") && req.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    const corsResponse = withCors(response, req.headers.get("origin") ?? undefined);
    return withSecurityHeaders(corsResponse);
  }

  const isAdminPage = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAdminApi = pathname.startsWith("/api/admin");

  if (!isAdminPage && !isAdminApi) {
    const response = NextResponse.next();
    if (pathname.startsWith("/api")) {
      const corsResponse = withCors(response, req.headers.get("origin") ?? undefined);
      return withSecurityHeaders(corsResponse);
    }
    return response;
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  if (!session || session.role !== "ADMIN") {
    if (isAdminApi) {
      const response = NextResponse.json(
        { status: "error", message: "Forbidden." },
        { status: 403 }
      );
      const corsResponse = withCors(response, req.headers.get("origin") ?? undefined);
      return withSecurityHeaders(corsResponse);
    }
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  if (pathname.startsWith("/api")) {
    const corsResponse = withCors(response, req.headers.get("origin") ?? undefined);
    return withSecurityHeaders(corsResponse);
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};


