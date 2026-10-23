import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      prisma.$runCommandRaw({ ping: 1 }),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error("Database timeout")), 5000); }),
    ]);
    return NextResponse.json({ status: "success", service: "voxlate-api" }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ status: "error", code: "service_unavailable", message: "The API isn't ready." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  } finally { clearTimeout(timer); }
}
