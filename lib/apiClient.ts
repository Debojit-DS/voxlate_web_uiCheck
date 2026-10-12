/** All browser API calls stay on the frontend origin; the server proxies upstream. */
export async function apiRequest(path: string, options: RequestInit = {}, timeoutMs = 15_000): Promise<Response> {
  if (!path.startsWith("/api/")) throw new Error("Expected a same-origin API path.");
  return fetch(path, {
    ...options,
    credentials: "include",
    cache: "no-store",
    signal: options.signal ?? AbortSignal.timeout(timeoutMs),
  });
}

export async function apiJson<T>(path: string, options: RequestInit = {}, timeoutMs = 15_000): Promise<T> {
  const response = await apiRequest(path, options, timeoutMs);
  const payload = await response.json().catch(() => null);
  if (!payload || typeof payload !== "object") throw new Error("The service returned an unreadable response. Please try again.");
  if (!response.ok && payload.status !== "error") throw new Error("The service is unavailable. Please try again.");
  return payload as T;
}
