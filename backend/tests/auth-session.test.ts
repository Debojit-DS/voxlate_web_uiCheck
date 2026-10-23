import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { attachSessionCookie, clearSessionCookie, signSession, verifySession } from "../lib/auth";
import { corsHeaders } from "../lib/cors";
import { POST as demoTicket } from "../app/api/demo/token/route";
import { POST as review } from "../app/api/reviews/route";
import { POST as application } from "../app/api/careers/apply/route";
import { POST as syncPhoto } from "../app/api/waitlist/sync-photo/route";

process.env.JWT_SECRET = "fixture-secret-only-not-for-production";
const user = { id: "fixture-user", name: "Fixture", email: "fixture@example.invalid", role: "USER" as const };

test("host-only production cookies preserve the session and retire the legacy domain", async () => {
  const original = process.env.NODE_ENV;
  Object.assign(process.env, { NODE_ENV: "production" });
  try {
    delete process.env.SESSION_COOKIE_DOMAIN;
    const response = NextResponse.json({status:"success"});
    await attachSessionCookie(response,user);
    const cookies = response.headers.getSetCookie();
    assert.equal(cookies.length,2);
    assert.match(cookies[0],/HttpOnly/);assert.match(cookies[0],/Secure/);assert.doesNotMatch(cookies[0],/Domain=/);
    assert.match(cookies[1],/Domain=.voxlatesn.in/);assert.match(cookies[1],/Max-Age=0/);
    const logout=NextResponse.json({status:"success"});clearSessionCookie(logout);
    assert.ok(logout.headers.getSetCookie().every(cookie=>cookie.includes("Max-Age=0")));
    assert.equal((await verifySession(await signSession(user)))?.sub,user.id);
  } finally { Object.assign(process.env, { NODE_ENV: original }); }
});
test("a demo ticket cannot be used as a web session", async () => {
  const token=await new SignJWT({email:user.email}).setProtectedHeader({alg:"HS256"}).setSubject(user.id).setAudience("voxlate-demo").setIssuer("voxlate-web").setIssuedAt().setExpirationTime("2m").sign(new TextEncoder().encode(process.env.JWT_SECRET));
  assert.equal(await verifySession(token),null);
});
test("CORS permits only exact configured origins",()=>{
  process.env.FRONTEND_URL="https://www.voxlatesn.in,https://preview.example";
  assert.equal(corsHeaders("https://www.voxlatesn.in")["Access-Control-Allow-Origin"],"https://www.voxlatesn.in");
  assert.equal(corsHeaders("https://unrelated.example")["Access-Control-Allow-Origin"],undefined);
});
test("anonymous demo tickets and profile sync are refused without database writes",async()=>{
  for(const handler of [demoTicket,syncPhoto]) {
    const response=await handler(new NextRequest("http://api.example/api/fixture",{method:"POST"}));
    assert.equal(response.status,401);
  }
});
test("malformed reviews and job applications return validation JSON before touching the database",async()=>{
  for(const handler of [review,application]) {
    for(const body of [null,{rating:3.5,text:"fixture"}]) {
      const response=await handler(new NextRequest("http://api.example/api/fixture",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}));
      assert.equal(response.status,400);assert.equal((await response.json()).code,"validation_error");
    }
  }
});

test("waitlisted session receives a two-minute demo ticket with the correct audience", async () => {
  const { prisma } = await import("../lib/db");
  const { jwtVerify } = await import("jose");
  const findUser=prisma.user.findUnique;
  const findEntry=prisma.waitlistEntry.findUnique;
  try {
    prisma.user.findUnique=(async () => ({id:user.id})) as unknown as typeof findUser;
    prisma.waitlistEntry.findUnique=(async () => ({id:"fixture-entry"})) as unknown as typeof findEntry;
    const response=await demoTicket(new NextRequest("http://api.example/api/demo/token",{method:"POST",headers:{Cookie:`voxlate_session=${await signSession(user)}`}}));
    assert.equal(response.status,200);
    const { token }=await response.json();
    const { payload }=await jwtVerify(token,new TextEncoder().encode(process.env.JWT_SECRET),{audience:"voxlate-demo",issuer:"voxlate-web",algorithms:["HS256"]});
    assert.equal(payload.sub,user.id);assert.equal(payload.email,user.email);assert.equal(payload.exp! - payload.iat!,120);
  } finally { prisma.user.findUnique=findUser;prisma.waitlistEntry.findUnique=findEntry; }
});

test("admin pagination uses defaults for omitted, fractional, invalid, or zero values", async () => {
  const { paginationParams } = await import("../lib/pagination");
  assert.deepEqual(paginationParams(new URLSearchParams()), { page: 1, pageSize: 25 });
  assert.deepEqual(paginationParams(new URLSearchParams("page=2.5&pageSize=0")), { page: 1, pageSize: 25 });
  assert.deepEqual(paginationParams(new URLSearchParams("page=2&pageSize=999")), { page: 2, pageSize: 100 });
  assert.deepEqual(paginationParams(new URLSearchParams(), 100, 500), { page: 1, pageSize: 100 });
});
test("CSV preserves text without executing user-provided spreadsheet formulas", async () => {
  const { toCsvValue } = await import("../lib/csv");
  assert.equal(toCsvValue("=1+1"), "'=1+1");
  assert.equal(toCsvValue('Name, \"quoted\"'), '\"Name, \"\"quoted\"\"\"');
});
test("an existing admin JWT loses access when the database role is downgraded", async () => {
  const { prisma } = await import("../lib/db");
  const { currentAdmin } = await import("../lib/session");
  const findUser=prisma.user.findUnique;
  const session={ sub:user.id, name:user.name, email:user.email, role:"ADMIN" as const };
  try {
    prisma.user.findUnique=(async () => ({ ...user, role:"ADMIN" })) as unknown as typeof findUser;
    assert.equal((await currentAdmin(session))?.role,"ADMIN");
    prisma.user.findUnique=(async () => ({ ...user, role:"USER" })) as unknown as typeof findUser;
    assert.equal(await currentAdmin(session),null);
  } finally { prisma.user.findUnique=findUser; }
});
