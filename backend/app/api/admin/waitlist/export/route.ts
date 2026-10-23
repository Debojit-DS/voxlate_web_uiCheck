import { paginationParams } from "@/lib/pagination";
import { NextRequest, NextResponse } from "next/server";
import { withCors, withSecurityHeaders, withCorrelationId } from "@/lib/cors";
import { generateCorrelationId } from "@/lib/correlationId";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

import { toCsvValue } from "@/lib/csv";

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
  const { page, pageSize } = paginationParams(searchParams, 100, 500);

  const entries = await prisma.waitlistEntry.findMany({
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const header = ["Name", "Email", "Company", "Type", "Product", "Source", "Joined At"];
  const rows = entries.map((e: (typeof entries)[number]) =>
    [
      toCsvValue(e.name),
      toCsvValue(e.email),
      toCsvValue(e.company),
      toCsvValue(e.type),
      toCsvValue(e.product),
      toCsvValue(e.source),
      e.createdAt.toISOString(),
    ].join(",")
  );

  const csv = [header.join(","), ...rows].join("\n");

  const filename = `waitlist-export-${new Date().toISOString().slice(0, 10)}.csv`;
  const res = new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
  return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  const res = new NextResponse(null, { status: 204 });
  return withSecurityHeaders(withCors(res, origin ?? undefined));
}
