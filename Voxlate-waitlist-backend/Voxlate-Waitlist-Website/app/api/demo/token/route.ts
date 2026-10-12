import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { withSecurityHeaders } from "@/lib/cors";

export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionToken ? await verifySession(sessionToken) : null;
  const respond = (body: unknown, status: number) => withSecurityHeaders(NextResponse.json(body, { status }));
  if (!session) return respond({ status: "error", message: "Sign in to use the demo." }, 401);
  try {
    const [user, entry] = await Promise.all([
      prisma.user.findUnique({ where: { id: session.sub }, select: { id: true } }),
      prisma.waitlistEntry.findUnique({ where: { email: session.email }, select: { id: true } }),
    ]);
    if (!user || !entry) return respond({ status: "error", message: "Join the waitlist to use the demo." }, 403);
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 16) throw new Error("Missing signing key");
    const token = await new SignJWT({ email: session.email })
      .setProtectedHeader({ alg: "HS256" }).setSubject(session.sub)
      .setAudience("voxlate-demo").setIssuer("voxlate-web").setIssuedAt().setExpirationTime("2m")
      .sign(new TextEncoder().encode(secret));
    return respond({ status: "success", token }, 200);
  } catch {
    return respond({ status: "error", message: "Demo access couldn't be verified. Please try again." }, 503);
  }
}
