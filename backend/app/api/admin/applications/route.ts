import type { Prisma } from "@prisma/client";
import { paginationParams } from "@/lib/pagination";
import { NextRequest, NextResponse } from "next/server";
import { withCors, withCorrelationId, withSecurityHeaders } from "@/lib/cors";
import { generateCorrelationId } from "@/lib/correlationId";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

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

  const where: Prisma.JobApplicationWhereInput = search ? {
    OR: [
      { fullName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { college: { contains: search, mode: "insensitive" } },
    ],
  } : {};

  const [applications, total] = await Promise.all([
    prisma.jobApplication.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.jobApplication.count({ where }),
  ]);

  const res = NextResponse.json({
    status: "success",
    data: applications,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
  return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  const res = new NextResponse(null, { status: 204 });
  return withSecurityHeaders(withCors(res, origin ?? undefined));
}
