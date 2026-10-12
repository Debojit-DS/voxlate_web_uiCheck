export type DemoResult = { original_text: string; translated_text: string; audio_base64: string };
export class DemoTransportError extends Error {
  kind: "quota" | "error" | "disconnected";
  constructor(kind: DemoTransportError["kind"], message: string) { super(message); this.kind = kind; }
}

export function demoSocketUrl(configured: string | undefined, pageProtocol: string, production: boolean) {
  if (!configured && production) throw new DemoTransportError("disconnected", "The translation service isn't configured yet.");
  const url = new URL(configured || "ws://localhost:8080/ws");
  if (!["ws:", "wss:"].includes(url.protocol) || url.username || url.password) throw new DemoTransportError("error", "The translation service address is invalid.");
  if (pageProtocol === "https:" && url.protocol !== "wss:") throw new DemoTransportError("disconnected", "A secure translation connection is required.");
  if (production && ["localhost", "127.0.0.1", "[::1]", "0.0.0.0"].includes(url.hostname)) throw new DemoTransportError("disconnected", "A deployed translation service is required.");
  return url.href;
}

/** Signed ticket → permission → clip → language → one validated result. */
export function translateRecording(options: {
  url: string; token: string; audio: Blob; language: string; signal: AbortSignal;
  socketFactory?: (url: string) => WebSocket; connectTimeoutMs?: number; resultTimeoutMs?: number;
}): Promise<DemoResult> {
  return new Promise((resolve, reject) => {
    let socket: WebSocket;
    let settled = false;
    let uploaded = false;
    let timer: ReturnType<typeof setTimeout>;
    const finish = (error?: DemoTransportError, result?: DemoResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      options.signal.removeEventListener("abort", cancel);
      if (socket) { socket.onopen = socket.onmessage = socket.onerror = socket.onclose = null; socket.close(); }
      if (error) reject(error); else resolve(result!);
    };
    const cancel = () => finish(new DemoTransportError("error", "Recording cancelled."));
    const arm = (ms: number) => {
      clearTimeout(timer);
      timer = setTimeout(() => finish(new DemoTransportError("disconnected", "The translation service took too long. Please try again.")), ms);
    };
    if (options.signal.aborted) { cancel(); return; }
    try { socket = (options.socketFactory ?? ((url) => new WebSocket(url)))(options.url); }
    catch { finish(new DemoTransportError("disconnected", "Couldn't connect to the translation service.")); return; }
    options.signal.addEventListener("abort", cancel, { once: true });
    arm(options.connectTimeoutMs ?? 10_000);
    socket.onopen = () => {
      try { socket.send(`auth: ${options.token}`); }
      catch { finish(new DemoTransportError("disconnected", "The connection was interrupted.")); }
    };
    socket.onmessage = async (event) => {
      if (settled || typeof event.data !== "string") return;
      if (event.data === "permitted") {
        if (uploaded) return;
        uploaded = true;
        arm(options.resultTimeoutMs ?? 90_000);
        try {
          const bytes = await options.audio.arrayBuffer();
          if (settled) return;
          socket.send(bytes);
          socket.send(`lang: ${options.language}`);
        } catch { finish(new DemoTransportError("disconnected", "Your recording couldn't be sent.")); }
      } else if (event.data === "denied") finish(new DemoTransportError("quota", "You've reached the demo limit for this account."));
      else if (event.data === "unauthorized") finish(new DemoTransportError("error", "Demo access expired. Sign in and try again."));
      else if (event.data === "error") finish(new DemoTransportError("error", "The translation service couldn't process this recording."));
      else if (event.data.trim().startsWith("{")) {
        try {
          const payload = JSON.parse(event.data);
          if (!uploaded || payload.status !== "success" || typeof payload.original_text !== "string" || typeof payload.translated_text !== "string" || typeof payload.audio_base64 !== "string" || !payload.audio_base64 || payload.audio_base64.length > 24 * 1024 * 1024) throw new Error("Invalid result");
          atob(payload.audio_base64);
          finish(undefined, payload);
        } catch { finish(new DemoTransportError("error", "The translation service returned an unreadable result.")); }
      }
    };
    socket.onerror = () => finish(new DemoTransportError("disconnected", "Couldn't reach the translation service. Please try again."));
    socket.onclose = () => finish(new DemoTransportError("disconnected", "The translation connection ended before a result arrived."));
  });
}
