import { NextRequest, NextResponse } from "next/server";
import { withCors, withCorrelationId, withSecurityHeaders } from "@/lib/cors";
import { getClientIp, generateCorrelationId } from "@/lib/correlationId";
import { checkRateLimit as checkSignupRateLimit } from "@/lib/rateLimiter";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { attachSessionCookie, hashPassword } from "@/lib/auth";
import { logAuth } from "@/lib/logger";

const signupSchema = z.object({
  name: z.string().min(1, "Full name is required").max(120),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the Terms of Service and Privacy Policy",
  }),
  photo: z.string().optional(),
}).refine((data) => {
  if (data.photo && !data.photo.startsWith("data:image/") && !data.photo.startsWith("http")) {
    return false;
  }
  return true;
}, {
  message: "Invalid photo format",
  path: ["photo"],
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

  const parsed = signupSchema.safeParse(body);
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
      event: "auth.signup.failed",
      method: req.method,
      route: "/api/auth/signup",
      status: 400,
      code: "validation_error",
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent") ?? null,
      correlationId,
      errors,
    });
    return withCorrelationId(withSecurityHeaders(withCors(res)), correlationId);
  }

  const { name, email, password, agreedToTerms, photo } = parsed.data;
  const ip = getClientIp(req);
  const rateLimitKey = `signup:${ip}`;
  if (!checkSignupRateLimit(rateLimitKey, 3, 60_000)) {
    const correlationId = generateCorrelationId();
    const res = NextResponse.json(
      { status: "error", code: "rate_limit", message: "Too many signup attempts. Please try again later." },
      { status: 429 }
    );
    await logAuth({
      event: "auth.signup.failed",
      method: req.method,
      route: "/api/auth/signup",
      status: 429,
      code: "rate_limit",
      ip,
      userAgent: req.headers.get("user-agent") ?? null,
      correlationId,
    });
    return withCorrelationId(withCors(res), correlationId);
  }
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: { name, email: normalizedEmail, password: passwordHash, photoUrl: photo || null },
    });

    const res = NextResponse.json(
      {
        status: "success",
        message: "Account created.",
        data: { id: user.id, name: user.name, email: user.email, photoUrl: user.photoUrl },
      },
      { status: 201 }
    );

    await attachSessionCookie(res, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const correlationId = generateCorrelationId();
    await logAuth({
      event: "auth.signup.completed",
      method: req.method,
      route: "/api/auth/signup",
      status: 201,
      ip,
      userAgent: req.headers.get("user-agent") ?? null,
      correlationId,
      email: normalizedEmail,
      userId: user.id,
      authMethod: "password",
    });

    return withCorrelationId(withSecurityHeaders(res), correlationId);
  } catch (err) {
    let correlationId: string | undefined;
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      correlationId = generateCorrelationId();
      const res = NextResponse.json(
        {
          status: "error",
          code: "email_taken",
          message: "An account with this email already exists.",
        },
        { status: 409 }
      );
      await logAuth({
        event: "auth.signup.failed",
        method: req.method,
        route: "/api/auth/signup",
        status: 409,
        code: "email_taken",
        ip,
        userAgent: req.headers.get("user-agent") ?? null,
        correlationId,
        email: normalizedEmail,
      });
      return withCorrelationId(withSecurityHeaders(withCors(res)), correlationId);
    }

    correlationId = generateCorrelationId();
    console.error("signup error", err);
    const res = NextResponse.json(
      { status: "error", code: "server_error", message: "Something went wrong." },
      { status: 500 }
    );
    await logAuth({
      event: "auth.signup.failed",
      method: req.method,
      route: "/api/auth/signup",
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
