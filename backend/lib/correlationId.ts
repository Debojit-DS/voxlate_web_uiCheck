import { NextRequest } from "next/server";
let correlationIdCounter = 0;

export function generateCorrelationId(): string {
  correlationIdCounter += 1;
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `${timestamp}-${correlationIdCounter}-${random}`;
}

export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}
