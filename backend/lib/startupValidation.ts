import { validateEnv } from "@/lib/db";
import { validateGoogleAuth } from "@/lib/auth";

export function validateStartup() {
  validateEnv();
  // Google is optional; its absence must not take password auth and public APIs offline.
  if (process.env.GOOGLE_CLIENT_ID) validateGoogleAuth();
}
