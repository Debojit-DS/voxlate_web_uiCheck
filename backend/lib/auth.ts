import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import type { NextResponse } from "next/server";

export const SESSION_COOKIE = "voxlate_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  photoUrl?: string;
};

export type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
};

function getSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "JWT_SECRET is not set (or too short). Set a strong random value in .env.local"
    );
  }
  return new TextEncoder().encode(secret);
}

export function validateGoogleAuth() {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error(
      "GOOGLE_CLIENT_ID is not set. Set it in .env.local to enable Google sign-in."
    );
  }
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "JWT_SECRET is not set (or too short). Set a strong random value in .env.local"
    );
  }
}

// ---- Passwords ----

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ---- Sessions (JWT in httpOnly cookie) ----

export async function signSession(user: SessionUser): Promise<string> {
  return new SignJWT({
    email: user.email,
    name: user.name,
    role: user.role,
  } satisfies Omit<SessionPayload, "sub">)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySession(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (!payload.sub || !payload.email || (payload.aud && payload.aud !== "voxlate-web")) {
      return null;
    }
    return {
      sub: payload.sub as string,
      email: payload.email as string,
      name: (payload.name as string) || "",
      role: (payload.role as "USER" | "ADMIN") || "USER", 
    };
  } catch { 
    return null;
  }
}

export async function attachSessionCookie(
  res: NextResponse,
  user: SessionUser
) {
  const token = await signSession(user);
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    domain: process.env.SESSION_COOKIE_DOMAIN || undefined,
    maxAge: SESSION_DURATION_SECONDS,
  });
  clearLegacyCookie(res);
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    domain: process.env.SESSION_COOKIE_DOMAIN || undefined,
    maxAge: 0,
  });
  clearLegacyCookie(res);
}

// Retire the old shared-domain cookie when moving to host-only sessions.
function clearLegacyCookie(res: NextResponse) {
  if (process.env.NODE_ENV === "production" && !process.env.SESSION_COOKIE_DOMAIN) {
    res.headers.append("Set-Cookie", `${SESSION_COOKIE}=; Path=/; Domain=.voxlatesn.in; Max-Age=0; HttpOnly; Secure; SameSite=Lax`);
  }
}
