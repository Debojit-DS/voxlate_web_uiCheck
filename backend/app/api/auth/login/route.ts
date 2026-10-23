import { NextRequest, NextResponse } from "next/server";
import { withCors, withCorrelationId, withSecurityHeaders } from "@/lib/cors";
import { getClientIp, generateCorrelationId } from "@/lib/correlationId";
import { checkRateLimit as checkLoginRateLimit } from "@/lib/rateLimiter";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { attachSessionCookie, verifyPassword } from "@/lib/auth";
import { logAuth } from "@/lib/logger";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    const res = NextResponse.json(
      { status: "error", code: "validation_error", message: "Invalid request body." },
      { status: 400 }
    );
    return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      errors[issue.path.join(".")] = issue.message;
    }
    const correlationId = generateCorrelationId();
    const res = NextResponse.json(
      {
        status: "error",
        code: "validation_error",
        message: "Please check the form for errors.",
        errors,
      },
      { status: 400 }
    );
    await logAuth({
      event: "auth.login.failed",
      method: req.method,
      route: "/api/auth/login",
      status: 400,
      code: "validation_error",
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent") ?? null,
      correlationId,
      errors,
    });
    return withCorrelationId(withSecurityHeaders(withCors(res)), correlationId);
  }

  const { email, password } = parsed.data;
  const ip = getClientIp(req);
  const rateLimitKey = `login:${ip}`;
  if (!checkLoginRateLimit(rateLimitKey, 5, 60_000)) {
    const correlationId = generateCorrelationId();
    const res = NextResponse.json(
      { status: "error", code: "rate_limit", message: "Too many login attempts. Please try again later." },
      { status: 429 }
    );
    await logAuth({
      event: "auth.login.failed",
      method: req.method,
      route: "/api/auth/login",
      status: 429,
      code: "rate_limit",
      ip,
      userAgent: req.headers.get("user-agent") ?? null,
      correlationId,
    });
    return withCorrelationId(withSecurityHeaders(withCors(res)), correlationId);
  }
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user || !(await verifyPassword(password, user.password))) {
      const correlationId = generateCorrelationId();
      const res = NextResponse.json(
        {
          status: "error",
          code: "invalid_credentials",
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
      await logAuth({
        event: "auth.login.failed",
        method: req.method,
        route: "/api/auth/login",
        status: 401,
        code: "invalid_credentials",
        ip,
        userAgent: req.headers.get("user-agent") ?? null,
        correlationId,
        email: normalizedEmail,
      });
      return withCorrelationId(withSecurityHeaders(withCors(res)), correlationId);
    }

    const res = NextResponse.json({
      status: "success",
      message: "Signed in.",
      data: { id: user.id, name: user.name, email: user.email, photoUrl: user.photoUrl },
    });

    await attachSessionCookie(res, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const correlationId = generateCorrelationId();
    await logAuth({
      event: "auth.login.completed",
      method: req.method,
      route: "/api/auth/login",
      status: 200,
      ip,
      userAgent: req.headers.get("user-agent") ?? null,
      correlationId,
      email: normalizedEmail,
      userId: user.id,
      authMethod: "password",
    });

    return withCorrelationId(withSecurityHeaders(res), correlationId);
  } catch (err) {
    const correlationId = generateCorrelationId();
    console.error("login error", err);
    const res = NextResponse.json(
      { status: "error", code: "server_error", message: "Something went wrong." },
      { status: 500 }
    );
    await logAuth({
      event: "auth.login.failed",
      method: req.method,
      route: "/api/auth/login",
      status: 500,
      code: "server_error",
      ip,
      userAgent: req.headers.get("user-agent") ?? null,
      correlationId,
      email: normalizedEmail,
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
