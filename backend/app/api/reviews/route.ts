import { NextRequest, NextResponse } from "next/server";
import { withCors, withCorrelationId, withSecurityHeaders } from "@/lib/cors";
import { generateCorrelationId, getClientIp } from "@/lib/correlationId";
import { prisma } from "@/lib/db";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimiter";
import { z } from "zod";

const publicFields = { id: true, authorName: true, authorPhotoUrl: true, text: true, rating: true, createdAt: true } as const;
const reviewSchema = z.object({
  text: z.string().trim().min(1).max(5000), rating: z.number().int().min(1).max(5),
  authorName: z.string().trim().max(120).optional(),
});
function respond(req: NextRequest, body: unknown, status = 200) {
  return withCorrelationId(withSecurityHeaders(withCors(NextResponse.json(body, { status }), req.headers.get("origin") ?? undefined)), generateCorrelationId());
}

export async function GET(req: NextRequest) {
  try {
    const reviews = await prisma.review.findMany({ orderBy: { createdAt: "desc" }, select: publicFields, take: 200 });
    return respond(req, { status: "success", reviews });
  } catch {
    return respond(req, { status: "error", code: "server_error", message: "Reviews are temporarily unavailable." }, 503);
  }
}

export async function POST(req: NextRequest) {
  const parsed = reviewSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return respond(req, { status: "error", code: "validation_error", message: "Enter a name, review (up to 5,000 characters), and a whole-number rating from 1 to 5." }, 400);
  if (!checkRateLimit(`review:${getClientIp(req)}`, 5, 60_000)) return respond(req, { status: "error", code: "rate_limit", message: "Please wait before posting another review." }, 429);
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;
  try {
    const account = session ? await prisma.user.findUnique({ where: { id: session.sub }, select: { name: true, email: true, photoUrl: true } }) : null;
    const authorName = account?.name || parsed.data.authorName;
    if (!authorName) return respond(req, { status: "error", code: "validation_error", message: "Your name is required." }, 400);
    const review = await prisma.review.create({
      data: { authorName, authorPhotoUrl: account?.photoUrl ?? null, userEmail: account?.email ?? null, text: parsed.data.text, rating: parsed.data.rating },
      select: publicFields,
    });
    return respond(req, { status: "success", review }, 201);
  } catch {
    return respond(req, { status: "error", code: "server_error", message: "Your review couldn't be saved. Please try again." }, 503);
  }
}

export async function OPTIONS(req: NextRequest) {
  return withSecurityHeaders(withCors(new NextResponse(null, { status: 204 }), req.headers.get("origin") ?? undefined));
}
