import { NextRequest, NextResponse } from "next/server";
import { withCors, withSecurityHeaders, withCorrelationId } from "@/lib/cors";
import { clearSessionCookie, verifySession } from "@/lib/auth";
import { getClientIp, generateCorrelationId } from "@/lib/correlationId";
import { logAuth } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("voxlate_session")?.value;
  const session = token ? await verifySession(token) : null;

  const correlationId = generateCorrelationId();
  const res = NextResponse.json({ status: "success", message: "Signed out." });
  clearSessionCookie(res);

  await logAuth({
    event: "auth.logout.completed",
    method: req.method,
    route: "/api/auth/logout",
    status: 200,
    ip: getClientIp(req),
    userAgent: req.headers.get("user-agent") ?? null,
    correlationId,
    email: session?.email ?? null,
    userId: session?.sub ?? null,
  });

  return withCorrelationId(withSecurityHeaders(res), correlationId);
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  const res = new NextResponse(null, { status: 204 });
  return withSecurityHeaders(withCors(res, origin ?? undefined));
}

