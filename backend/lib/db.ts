import { PrismaClient } from "@prisma/client";

const globalDb = globalThis as unknown as { voxlatePrisma?: PrismaClient };
const prisma = globalDb.voxlatePrisma ?? new PrismaClient(
  process.env.DATABASE_URL
    ? { datasources: { db: { url: process.env.DATABASE_URL } } }
    : undefined
);
if (process.env.NODE_ENV !== "production") globalDb.voxlatePrisma = prisma;

export function validateEnv() {
  const required = ["DATABASE_URL", "JWT_SECRET"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && !dbUrl.includes("tls=true") && !dbUrl.includes("ssl=true") && !dbUrl.includes("mongodb+srv://")) {
    console.warn(
      "DATABASE_URL does not appear to enforce TLS/SSL. For production, ensure your MongoDB connection uses TLS."
    );
  }
}

export { prisma };
