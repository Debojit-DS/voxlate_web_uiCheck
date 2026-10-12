/** Authentication return paths must stay within this website. */
export function safeRedirect(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\") || /[\u0000-\u001f]/.test(value)) return "/";
  try {
    const base = "https://voxlate.invalid";
    const target = new URL(value, base);
    return target.origin === base ? target.pathname + target.search + target.hash : "/";
  } catch { return "/"; }
}
