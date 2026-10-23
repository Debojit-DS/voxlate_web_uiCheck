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

  const [totalWaitlist, totalUsers, newLast7Days, totalApplications, byProduct, byType] = await Promise.all([
    prisma.waitlistEntry.count(),
    prisma.user.count(),
    prisma.user.count({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    }),
    prisma.jobApplication.count(),
    prisma.waitlistEntry.groupBy({
      by: ["product"],
      _count: { product: true },
    }),
    prisma.waitlistEntry.groupBy({
      by: ["type"],
      _count: { type: true },
    }),
  ]);

  const res = NextResponse.json({
    status: "success",
    data: {
      totalWaitlist,
      totalUsers,
      newLast7Days,
      totalApplications,
      byProduct: byProduct.map((item) => ({ product: item.product, count: item._count.product })),
      byType: byType.map((item) => ({ type: item.type, count: item._count.type })),
    },
  });
  return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  const res = new NextResponse(null, { status: 204 });
  return withSecurityHeaders(withCors(res, origin ?? undefined));
}
