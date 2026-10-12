import { apiRequest } from "./apiClient";
import type { WaitlistFormValues } from "./validation";

export type WaitlistResponse =
  | { status: "success"; message: string; data: { id: string; email: string; position?: number } }
  | { status: "error"; code: "duplicate_email"; message: string }
  | { status: "error"; code: "validation_error"; message: string; errors?: Record<string, string> }
  | { status: "error"; code: "server_error"; message: string };

export type WaitlistCheckResponse =
  | { status: "success"; data: { joined: boolean } }
  | { status: "error"; code: "server_error"; message: string };

export type PublicWaitlistEntry = {
  id: string;
  name: string;
  role: string | null;
  organization: string | null;
  photoUrl: string | null;
  createdAt: string;
};

export type PublicWaitlistResponse = {
  status: "success";
  /** Set when the request failed, so the page can tell an outage from an empty list. */
  failed?: true;
  data: PublicWaitlistEntry[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export async function getPublicWaitlist(page = 1, pageSize = 20): Promise<PublicWaitlistResponse> {
  try {
    const res = await apiRequest(`/api/waitlist?page=${page}&pageSize=${pageSize}`, {
      method: "GET",
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      return {
        status: "success",
        data: [],
        pagination: { page, pageSize, total: 0, totalPages: 0 },
        failed: true,
      };
    }

    const json = (await res.json()) as Partial<PublicWaitlistResponse>;
    if (json.status !== "success" || !json.pagination || !Array.isArray(json.data)) {
      return {
        status: "success",
        data: [],
        pagination: { page, pageSize, total: 0, totalPages: 0 },
        failed: true,
      };
    }

    return json as PublicWaitlistResponse;
  } catch {
    return {
      status: "success",
      data: [],
      pagination: { page, pageSize, total: 0, totalPages: 0 },
      failed: true,
    };
  }
}

export async function submitToWaitlist(payload: WaitlistFormValues): Promise<WaitlistResponse> {
    try {
    const res = await apiRequest("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });
    const data = await res.json();
    if ((res.ok && data.status === "success" && typeof data.data?.id === "string") || (!res.ok && data.status === "error" && typeof data.message === "string")) return data;
    throw new Error("Unexpected waitlist response");
  } catch {
    return { status: "error", code: "server_error", message: "Something went wrong." };
  }
}

export async function checkWaitlistStatus(email: string): Promise<WaitlistCheckResponse> {
  try {
    const res = await apiRequest(`/api/waitlist?email=${encodeURIComponent(email)}`, {
      method: "GET",
      signal: AbortSignal.timeout(10_000),
    });
    const data = await res.json();
    if (res.ok && data.status === "success" && typeof data.data?.joined === "boolean") return data;
    throw new Error("Unexpected waitlist status");
  } catch {
    return { status: "error", code: "server_error", message: "Something went wrong." };
  }
}

export async function syncWaitlistPhoto(email: string, photo: string): Promise<void> {
  try {
    await apiRequest("/api/waitlist/sync-photo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, photo }),
      credentials: "include",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    // ignore
  }
}
