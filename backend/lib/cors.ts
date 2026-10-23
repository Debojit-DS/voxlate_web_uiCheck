import { NextResponse } from "next/server";
import { getSecurityHeaders } from "./securityHeaders";

export function corsHeaders(origin?: string): Record<string, string> {
  const allowed = (process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3002")
    .split(",").map((value) => value.trim()).filter(Boolean);
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
  if (origin && allowed.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Credentials"] = "true";
  }
  return headers;
}

export function withCors(response: NextResponse, origin?: string): NextResponse {
  for (const [key, value] of Object.entries(corsHeaders(origin))) response.headers.set(key, value);
  const vary = response.headers.get("Vary");
  response.headers.set("Vary", vary ? `${vary}, Origin` : "Origin");
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "no-store");
  const securityHeaders = getSecurityHeaders();
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
  return response;
}

export function withCorrelationId(response: NextResponse, correlationId: string): NextResponse {
  response.headers.set("X-Correlation-ID", correlationId);
  return response;
}
