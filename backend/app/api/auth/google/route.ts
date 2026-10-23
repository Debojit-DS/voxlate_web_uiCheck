import { NextRequest, NextResponse } from "next/server";
import { withCors, withCorrelationId, withSecurityHeaders } from "@/lib/cors";
import { getClientIp, generateCorrelationId } from "@/lib/correlationId";
import { checkRateLimit as checkGoogleRateLimit } from "@/lib/rateLimiter";
import { prisma } from "@/lib/db";
import { attachSessionCookie } from "@/lib/auth";
import { OAuth2Client } from "google-auth-library";
import { logAuth } from "@/lib/logger";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req: NextRequest) {
  if (!process.env.GOOGLE_CLIENT_ID) return withSecurityHeaders(NextResponse.json({ status: "error", code: "service_unavailable", message: "Google sign-in isn't configured. Please use email and password." }, { status: 503 }));
  try {
    const body = await req.json().catch(() => null);
    const idToken = body?.idToken;
    const ip = getClientIp(req);
    const rateLimitKey = `google:${ip}`;
    if (!checkGoogleRateLimit(rateLimitKey, 5, 60_000)) {
      const correlationId = generateCorrelationId();
      const res = NextResponse.json(
        { status: "error", code: "rate_limit", message: "Too many Google sign-in attempts. Please try again later." },
        { status: 429 }
      );
      await logAuth({
        event: "auth.google.failed",
        method: req.method,
        route: "/api/auth/google",
        status: 429,
        code: "rate_limit",
        ip,
        userAgent: req.headers.get("user-agent") ?? null,
        correlationId,
      });
      return withCorrelationId(withCors(res), correlationId);
    }

    if (typeof idToken !== "string" || !idToken) {
      const correlationId = generateCorrelationId();
      const res = NextResponse.json(
        { status: "error", code: "validation_error", message: "Google ID token is required." },
        { status: 400 }
      );
      await logAuth({
        event: "auth.google.failed",
        method: req.method,
        route: "/api/auth/google",
        status: 400,
        code: "validation_error",
        ip,
        userAgent: req.headers.get("user-agent") ?? null,
        correlationId,
      });
      return withCorrelationId(withSecurityHeaders(withCors(res)), correlationId);
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !payload?.name) {
      const correlationId = generateCorrelationId();
      const res = NextResponse.json(
        { status: "error", code: "invalid_token", message: "Invalid Google token." },
        { status: 401 }
      );
      await logAuth({
        event: "auth.google.failed",
        method: req.method,
        route: "/api/auth/google",
        status: 401,
        code: "invalid_token",
        ip,
        userAgent: req.headers.get("user-agent") ?? null,
        correlationId,
      });
      return withCorrelationId(withSecurityHeaders(withCors(res)), correlationId);
    }

    const normalizedEmail = payload.email.toLowerCase().trim();

    let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: payload.name,
          email: normalizedEmail,
          role: "USER",
          password: await (await import("@/lib/auth")).hashPassword(Math.random().toString(36)),
        },
      });
    }

    const res = NextResponse.json({
      status: "success",
      message: "Signed in with Google.",
      data: { id: user.id, name: user.name, email: user.email },
    });

    await attachSessionCookie(res, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || "USER",
    });

    const correlationId = generateCorrelationId();
    await logAuth({
      event: "auth.google.completed",
      method: req.method,
      route: "/api/auth/google",
      status: 200,
      ip,
      userAgent: req.headers.get("user-agent") ?? null,
      correlationId,
      email: normalizedEmail,
      userId: user.id,
      authMethod: "google",
      isNewUser: !(await prisma.user.count({ where: { email: normalizedEmail } }) > 0),
    });

    return withCorrelationId(withSecurityHeaders(res), correlationId);
  } catch (err) {
    const correlationId = generateCorrelationId();
    console.error("google auth error", err);
    const res = NextResponse.json(
      { status: "error", code: "server_error", message: "Something went wrong." },
      { status: 500 }
    );
    await logAuth({
      event: "auth.google.failed",
      method: req.method,
      route: "/api/auth/google",
      status: 500,
      code: "server_error",
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent") ?? null,
      correlationId,
      errorMessage: err instanceof Error ? err.message : "unknown",
    });
    return withCorrelationId(withSecurityHeaders(withCors(res)), correlationId);
  }
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  const res = new NextResponse(null, { status: 204 });
  return withSecurityHeaders(withCors(res, origin ?? undefined));
}
