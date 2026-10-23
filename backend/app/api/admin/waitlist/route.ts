import { paginationParams } from "@/lib/pagination";
import { NextRequest, NextResponse } from "next/server";
import { withCors, withCorrelationId, withSecurityHeaders } from "@/lib/cors";
import { generateCorrelationId } from "@/lib/correlationId";
import { Prisma, WaitlistProduct, WaitlistType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

function isWaitlistProduct(value: string): value is WaitlistProduct {
  return (Object.values(WaitlistProduct) as string[]).includes(value);
}

function isWaitlistType(value: string): value is WaitlistType {
  return (Object.values(WaitlistType) as string[]).includes(value);
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    const res = NextResponse.json(
      { status: "error", message: "Forbidden." },
      { status: 403 }
    );
    return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
  }

  const { searchParams } = new URL(req.url);
  const { page, pageSize } = paginationParams(searchParams, 25, 100);
  const search = searchParams.get("search")?.trim();
  const product = searchParams.get("product");
  const type = searchParams.get("type");

  const where: Prisma.WaitlistEntryWhereInput = {
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { company: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(product && product !== "all" && isWaitlistProduct(product) ? { product } : {}),
    ...(type && type !== "all" && isWaitlistType(type) ? { type } : {}),
  };

  const [entries, total] = await Promise.all([
    prisma.waitlistEntry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.waitlistEntry.count({ where }),
  ]);

  const res = NextResponse.json({
    status: "success",
    data: entries,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
  return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    const res = NextResponse.json(
      { status: "error", message: "Forbidden." },
      { status: 403 }
    );
    return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    const res = NextResponse.json(
      { status: "error", message: "Missing id." },
      { status: 400 }
    );
    return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
  }

  try {
    await prisma.waitlistEntry.delete({ where: { id } });
  } catch (err) {
    console.error("waitlist delete error");
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      const res = NextResponse.json(
        { status: "error", message: "Entry not found." },
        { status: 404 }
      );
      return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
    }
    const res = NextResponse.json(
      { status: "error", message: "Something went wrong." },
      { status: 500 }
    );
    return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
  }

  const res = NextResponse.json({ status: "success", message: "Entry deleted." });
  return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  const res = new NextResponse(null, { status: 204 });
  return withSecurityHeaders(withCors(res, origin ?? undefined));
}
