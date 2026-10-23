import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession, type SessionPayload } from "@/lib/auth";

/**
 * Reads and verifies the session cookie for the current request.
 * Returns null if there is no session or it is invalid/expired.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function currentAdmin(session: SessionPayload | null): Promise<SessionPayload | null> {
  if (!session || session.role !== "ADMIN") return null;
  const account = await prisma.user.findUnique({ where: { id: session.sub }, select: { role: true, name: true, email: true } });
  if (!account || account.role !== "ADMIN") return null;
  return { ...session, name: account.name, email: account.email, role: "ADMIN" };
}

export async function requireAdmin(): Promise<SessionPayload | null> {
  return currentAdmin(await getSession());
}
