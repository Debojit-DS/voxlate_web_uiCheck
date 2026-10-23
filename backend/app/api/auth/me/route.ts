import { NextRequest, NextResponse } from "next/server";
import { withCors, withCorrelationId, withSecurityHeaders } from "@/lib/cors";
import { getClientIp, generateCorrelationId } from "@/lib/correlationId";
import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { logAuth } from "@/lib/logger";

const updatePhotoSchema = z.object({
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

export async function GET(req: NextRequest) {
  const token = req.cookies.get("voxlate_session")?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    const correlationId = generateCorrelationId();
    const res = NextResponse.json(
      { status: "error", code: "unauthorized", message: "Not signed in." },
      { status: 401 }
    );
    await logAuth({
      event: "auth.me.failed",
      method: req.method,
      route: "/api/auth/me",
      status: 401,
      code: "unauthorized",
      ip: getClientIp ? getClientIp(req) : null,
      userAgent: req.headers.get("user-agent") ?? null,
      correlationId,
    });
    return withCorrelationId(withSecurityHeaders(withCors(res)), correlationId);
  }

  try {
  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, email: true, name: true, role: true, photoUrl: true },
  });

  if (!user) return withSecurityHeaders(NextResponse.json({ status: "error", code: "unauthorized", message: "Not signed in." }, { status: 401 }));
  const correlationId = generateCorrelationId();
  const res = NextResponse.json({
    status: "success",
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      ...(user?.photoUrl ? { photoUrl: user.photoUrl } : {}),
    },
  });
  await logAuth({
    event: "auth.me.completed",
    method: req.method,
    route: "/api/auth/me",
    status: 200,
    ip: getClientIp ? getClientIp(req) : null,
    userAgent: req.headers.get("user-agent") ?? null,
    correlationId,
    email: session.email,
    userId: session.sub,
  });
  return withCorrelationId(withSecurityHeaders(res), correlationId);
  } catch {
    return withSecurityHeaders(NextResponse.json({ status: "error", code: "server_error", message: "Your session couldn't be loaded. Please try again." }, { status: 503 }));
  }
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  const res = new NextResponse(null, { status: 204 });
  return withSecurityHeaders(withCors(res, origin ?? undefined));
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get("voxlate_session")?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    const correlationId = generateCorrelationId();
    const res = NextResponse.json(
      { status: "error", code: "unauthorized", message: "Not signed in." },
      { status: 401 }
    );
    await logAuth({
      event: "auth.me.update_photo.failed",
      method: req.method,
      route: "/api/auth/me",
      status: 401,
      code: "unauthorized",
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent") ?? null,
      correlationId,
    });
    return withCorrelationId(withSecurityHeaders(withCors(res)), correlationId);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    const correlationId = generateCorrelationId();
    const res = NextResponse.json(
      { status: "error", code: "validation_error", message: "Invalid request body." },
      { status: 400 }
    );
    await logAuth({
      event: "auth.me.update_photo.failed",
      method: req.method,
      route: "/api/auth/me",
      status: 400,
      code: "validation_error",
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent") ?? null,
      correlationId,
    });
    return withCorrelationId(withSecurityHeaders(withCors(res)), correlationId);
  }

  const parsed = updatePhotoSchema.safeParse(body);
  if (!parsed.success) {
    const correlationId = generateCorrelationId();
    const res = NextResponse.json(
      {
        status: "error",
        code: "validation_error",
        message: "Invalid photo format.",
      },
      { status: 400 }
    );
    await logAuth({
      event: "auth.me.update_photo.failed",
      method: req.method,
      route: "/api/auth/me",
      status: 400,
      code: "validation_error",
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent") ?? null,
      correlationId,
      email: session.email,
      userId: session.sub,
    });
    return withCorrelationId(withSecurityHeaders(withCors(res)), correlationId);
  }

  const { photo } = parsed.data;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: session.sub },
      data: { photoUrl: photo || null },
      select: { id: true, name: true, email: true, photoUrl: true },
    });

    const correlationId = generateCorrelationId();
    const res = NextResponse.json({
      status: "success",
      message: "Profile photo updated.",
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        ...(updatedUser.photoUrl ? { photoUrl: updatedUser.photoUrl } : {}),
      },
    });
    await logAuth({
      event: "auth.me.update_photo.completed",
      method: req.method,
      route: "/api/auth/me",
      status: 200,
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent") ?? null,
      correlationId,
      email: session.email,
      userId: session.sub,
    });
    return withCorrelationId(withSecurityHeaders(withCors(res)), correlationId);
  } catch (err) {
    const correlationId = generateCorrelationId();
    console.error("update photo error", err);
    const res = NextResponse.json(
      { status: "error", code: "server_error", message: "Something went wrong." },
      { status: 500 }
    );
    await logAuth({
      event: "auth.me.update_photo.failed",
      method: req.method,
      route: "/api/auth/me",
      status: 500,
      code: "server_error",
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent") ?? null,
      correlationId,
      email: session.email,
      userId: session.sub,
      errorMessage: err instanceof Error ? err.message : "unknown",
    });
    return withCorrelationId(withSecurityHeaders(withCors(res)), correlationId);
  }
}
