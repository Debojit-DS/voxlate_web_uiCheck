import type { AuthPayloadLogin, AuthPayloadSignup, AuthResponse } from "./authTypes";
import { apiJson } from "./apiClient";

async function authenticate(path: string, payload: AuthPayloadLogin | AuthPayloadSignup): Promise<AuthResponse> {
  try {
    const result = await apiJson<AuthResponse>(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (result.status === "success" && (!result.data?.id || !result.data.email || !result.data.name)) throw new Error("Invalid session response");
    return result;
  } catch {
    return { status: "error", code: "server_error", message: "Couldn't reach the service. Please try again." };
  }
}

export function loginUser(payload: AuthPayloadLogin) { return authenticate("/api/auth/login", payload); }
export function signupUser(payload: AuthPayloadSignup) { return authenticate("/api/auth/signup", payload); }
