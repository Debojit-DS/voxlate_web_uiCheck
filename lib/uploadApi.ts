import { apiRequest } from "./apiClient";
export async function uploadPhoto(base64: string): Promise<{ url: string } | null> {
  try {
    const res = await apiRequest("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photo: base64 }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status === "success" && data.data?.url) {
      return { url: data.data.url };
    }
    return null;
  } catch {
    return null;
  }
}
