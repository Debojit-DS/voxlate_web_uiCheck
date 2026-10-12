"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, RotateCcw, Loader2, Lock, TriangleAlert } from "lucide-react";
import { useDemoGate } from "@/components/auth/useDemoGate";
import { useWaitlistModal } from "@/components/waitlist/WaitlistModalProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAuthPrompt } from "@/components/auth/AuthPromptProvider";
import { Button } from "@/components/ui/Button";
import { LanguageSelect } from "@/components/ui/LanguageSelect";
import { apiJson } from "@/lib/apiClient";
import { demoSocketUrl, translateRecording, DemoTransportError } from "@/lib/demoTransport";
import { useRouter, useSearchParams } from "next/navigation";

import { DEMO_LANGUAGE_NAMES as LANGUAGES, DEMO_LANGUAGE_CODES as LANGUAGE_MAP } from "@/lib/demoLanguages";

const DEMO_LIMIT = 5;

type Phase =
  | "idle"
  | "permission"
  | "denied"
  | "recording"
  | "processing"
  | "result"
  | "error"
  | "disconnected"
  | "quota";

const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export function DemoCard() {
  const [language, setLanguage] = useState("Hindi");
  const [phase, setPhase] = useState<Phase>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [originalText, setOriginalText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [resultLanguage, setResultLanguage] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState("");

  const { isAllowed, status: gateStatus, refresh: refreshGate, isLoading: isGateLoading, promptJoinWaitlist } = useDemoGate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { openPrompt } = useAuthPrompt();
  const { openModal } = useWaitlistModal();
  const router = useRouter();
  const searchParams = useSearchParams();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const requestRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(false);
  const recordTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordingLanguage = useRef(language);

  // Arriving from login/signup with ?autoOpen=waitlist opens the next step.
  useEffect(() => {
    const autoOpen = searchParams.get("autoOpen");
    if (autoOpen !== "waitlist") return;
    if (isAuthLoading) return;

    if (user) {
      openModal("demo-gate");
    } else {
      openPrompt();
    }
    const url = new URL(window.location.href);
    url.searchParams.delete("autoOpen");
    router.replace(url.pathname + url.search);
  }, [searchParams, user, isAuthLoading, openModal, openPrompt, router]);

  // Elapsed recording time.
  useEffect(() => {
    if (phase !== "recording") return;
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  // Suppress late permission responses and recorder callbacks after unmount.
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (recordTimer.current) clearTimeout(recordTimer.current);
      const recorder = mediaRecorderRef.current;
      if (recorder) { recorder.onstop = null; if (recorder.state !== "inactive") recorder.stop(); recorder.stream.getTracks().forEach((track) => track.stop()); }
      requestRef.current?.abort();
    };
  }, []);
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const resetResult = () => {
    setOriginalText("");
    setTranslatedText("");
    setAudioUrl(null);
    setErrorDetail("");
  };

  const startRecording = async () => {
    if (!user) {
      promptJoinWaitlist({ redirectTo: "/demo", autoOpen: "waitlist" });
      return;
    }
    if (!isAllowed) {
      openModal("demo-gate");
      return;
    }
    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setErrorDetail("This browser can't record audio. Try a recent version of Chrome, Edge, Firefox or Safari.");
      setPhase("error");
      return;
    }

    resetResult();
    setPhase("permission");
    let stream: MediaStream | undefined;
    try {
      // Catch deployment misconfiguration before asking for microphone access.
      demoSocketUrl(process.env.NEXT_PUBLIC_WS_URL, window.location.protocol, process.env.NODE_ENV === "production");
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!mountedRef.current) { stream.getTracks().forEach((track) => track.stop()); return; }
      const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recordingLanguage.current = language;
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        if (recordTimer.current) clearTimeout(recordTimer.current);
        recorder.stream.getTracks().forEach((track) => track.stop());
        if (mountedRef.current) {
          setPhase("processing");
          void sendAudioToServer(new Blob(audioChunksRef.current, { type: recorder.mimeType }), recordingLanguage.current);
        }
      };

      recorder.onerror = () => {
        recorder.onstop = null;
        recorder.stream.getTracks().forEach((track) => track.stop());
        if (recordTimer.current) clearTimeout(recordTimer.current);
        if (mountedRef.current) { setErrorDetail("The browser couldn't record audio. Please try again."); setPhase("error"); }
      };
      recorder.start();
      recordTimer.current = setTimeout(() => { if (recorder.state === "recording") recorder.stop(); }, 60_000);
      setElapsed(0);
      setPhase("recording");
    } catch (err) {
      stream?.getTracks().forEach((track) => track.stop());
      if (!mountedRef.current) return;
      if (err instanceof DOMException && ["NotAllowedError", "SecurityError"].includes(err.name)) setPhase("denied");
      else { setErrorDetail(err instanceof Error ? err.message : "The microphone couldn't be started."); setPhase(err instanceof DemoTransportError ? err.kind : "error"); }
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && phase === "recording") {
      recorder.stop();
      recorder.stream.getTracks().forEach((track) => track.stop());
      setPhase("processing");
    }
  };

  const sendAudioToServer = async (audio: Blob, targetLanguage: string) => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    try {
      if (!audio.size || audio.size > 10 * 1024 * 1024) throw new Error("Record a short clip, up to 60 seconds and 10 MB.");
      const url = demoSocketUrl(process.env.NEXT_PUBLIC_WS_URL, window.location.protocol, process.env.NODE_ENV === "production");
      const ticket = await apiJson<{ status: string; token?: string; message?: string }>("/api/demo/token", { method: "POST", signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15_000)]) });
      if (ticket.status !== "success" || !ticket.token) throw new Error(ticket.message || "Demo access couldn't be verified. Please try again.");
      const payload = await translateRecording({ url, token: ticket.token, audio, language: LANGUAGE_MAP[targetLanguage], signal: controller.signal });
      if (!mountedRef.current || controller.signal.aborted) return;
      const bytes = Uint8Array.from(atob(payload.audio_base64), (char) => char.charCodeAt(0));
      setOriginalText(payload.original_text);
      setTranslatedText(payload.translated_text);
      setResultLanguage(targetLanguage);
      setAudioUrl(URL.createObjectURL(new Blob([bytes], { type: "audio/wav" })));
      setPhase("result");
    } catch (cause) {
      if (!mountedRef.current || controller.signal.aborted) return;
      setErrorDetail(cause instanceof Error ? cause.message : "Translation failed. Please try again.");
      setPhase(cause instanceof DemoTransportError ? cause.kind : "error");
    }
  };

  const busy = phase === "permission" || phase === "recording" || phase === "processing";
  const gate: "ok" | "checking" | "signin" | "join" | "error" = isAuthLoading || (user && isGateLoading)
    ? "checking"
    : !user
      ? "signin"
      : gateStatus === "error"
        ? "error"
      : !isAllowed
        ? "join"
        : "ok";

  const statusText: Record<Phase, string> = {
    idle: "Tap the microphone and start speaking. Press Stop when you’ve finished.",
    permission: "Allow microphone access in your browser to continue.",
    denied: "Microphone access was blocked. Allow it in your browser’s site settings, then try again.",
    recording: "Listening… tap Stop when you’ve finished speaking. Clips stop automatically at 60 seconds.",
    processing: "Recording sent. Translating and generating voice… this can take several seconds.",
    result: "Translation ready.",
    error: errorDetail || "Something went wrong while processing your recording.",
    disconnected: errorDetail || "Couldn’t reach the translation service. It may be offline — please try again later.",
    quota: `You’ve reached the demo limit for this account (${DEMO_LIMIT} translations).`,
  };
  const isProblem = phase === "denied" || phase === "error" || phase === "disconnected" || phase === "quota";

  return (
    <section aria-labelledby="demo-tool-title" className="page-container">
      <h2 id="demo-tool-title" className="sr-only">Translation tool</h2>
      <div className="rounded-[8px] border border-line bg-surface">
        {/* Controls */}
        <div className="flex flex-col gap-4 border-b border-line p-5 sm:p-7 md:flex-row md:items-end md:justify-between">
          <div className="w-full max-w-[320px]">
            <LanguageSelect
              id="demo-language"
              label="1. Translate To"
              value={language}
              options={LANGUAGES}
              onChange={setLanguage}
              disabled={busy}
            />
          </div>
          <p className="max-w-[46ch] text-[14px] leading-relaxed text-slate">
            Your voice will be translated to {language}. Speak in your own language — the service transcribes your
            recording and detects the language. Each account can run up to {DEMO_LIMIT} translations.
          </p>
        </div>

        <div className="grid md:grid-cols-2">
          {/* Your speech */}
          <div className="border-b border-line p-5 sm:p-7 md:border-b-0 md:border-r">
            <h3 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-slate">2. Your speech · Tap &amp; Speak</h3>

            {gate !== "ok" ? (
              <div className="mt-6 rounded-[6px] bg-mist p-5">
                {gate === "checking" ? (
                  <p className="flex items-center gap-2 text-[15px] text-ink" role="status">
                    <Loader2 size={16} className="animate-spin" aria-hidden /> Checking demo access…
                  </p>
                ) : gate === "error" ? (
                  <div role="status">
                    <p className="text-[15px] text-slate">Demo access couldn&apos;t be checked. Please try again.</p>
                    <Button variant="secondary" className="mt-4" onClick={() => void refreshGate()}>Retry access check</Button>
                  </div>
                ) : (
                  <>
                    <p className="flex items-center gap-2 text-[16px] font-semibold text-ink">
                      <Lock size={16} aria-hidden />
                      Join the waitlist → Demo unlocked
                    </p>
                    <p className="mt-2 text-[15px] leading-relaxed text-slate">
                      {gate === "signin"
                        ? "It's free for you. Log in or create an account, then join the waitlist."
                        : "It's free for you. The demo unlocks as soon as you're on the list."}
                    </p>
                    <div className="mt-5">
                      <Button
                        onClick={() =>
                          gate === "signin"
                            ? promptJoinWaitlist({ redirectTo: "/demo", autoOpen: "waitlist" })
                            : openModal("demo-gate")
                        }
                      >
                        Join Waitlist
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="mt-6">
                <div className="flex flex-wrap items-center gap-4">
                  {phase === "recording" ? (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="inline-flex h-14 items-center gap-3 rounded-[6px] bg-ink px-6 text-[16px] font-semibold text-white transition-colors hover:bg-[#0f1d28]"
                    >
                      <Square size={16} fill="currentColor" aria-hidden />
                      Stop recording
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={phase === "result" ? () => { resetResult(); setPhase("idle"); } : startRecording}
                      disabled={phase === "permission" || phase === "processing" || phase === "quota"}
                      className="inline-flex h-14 items-center gap-3 rounded-[6px] bg-primary px-6 text-[16px] font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {phase === "processing" ? (
                        <Loader2 size={18} className="animate-spin" aria-hidden />
                      ) : phase === "result" ? (
                        <RotateCcw size={18} aria-hidden />
                      ) : (
                        <Mic size={18} aria-hidden />
                      )}
                      {phase === "processing" ? "Processing…" : phase === "result" ? "Record again" : "Start recording"}
                    </button>
                  )}
                  {phase === "recording" && (
                    <span className="flex items-center gap-2 font-mono text-[15px] text-ink" aria-label={`Recording time ${formatTime(elapsed)}`}>
                      <span className="h-2.5 w-2.5 rounded-full bg-danger" aria-hidden />
                      {formatTime(elapsed)}
                    </span>
                  )}
                </div>

                <p
                  role="status"
                  className={`mt-4 flex items-start gap-2 text-[15px] leading-relaxed ${isProblem ? "text-danger" : "text-slate"}`}
                >
                  {isProblem && <TriangleAlert size={16} className="mt-1 shrink-0" aria-hidden />}
                  {statusText[phase]}
                </p>
              </div>
            )}

            <div className="mt-8">
              <p className="text-[13px] font-medium text-slate">What you said (original)</p>
              <p className="mt-2 min-h-[3.5rem] text-[17px] leading-relaxed text-ink">
                {originalText || <span className="text-slate">Your transcript will appear here.</span>}
              </p>
            </div>
          </div>

          {/* Translation */}
          <div className="p-5 sm:p-7">
            <h3 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-slate">
              3. Translation · How They Will Hear You{resultLanguage && phase === "result" ? ` · ${resultLanguage}` : ""}
            </h3>
            <p className="mt-6 min-h-[3.5rem] text-[17px] leading-relaxed text-ink">
              {translatedText || <span className="text-slate">The translated text returns here once processing finishes.</span>}
            </p>

            <div className="mt-8">
              <p className="text-[13px] font-medium text-slate">Translated audio</p>
              {audioUrl ? (
                <audio controls src={audioUrl} className="mt-3 w-full">
                  Your browser can&apos;t play this audio.
                </audio>
              ) : (
                <p className="mt-2 text-[15px] text-slate">Playback appears when audio is returned.</p>
              )}
            </div>

            <div className="mt-8 border-t border-line pt-5">
              <h4 className="text-[15px] font-semibold text-ink">Enjoying the demo?</h4>
              <p className="mt-1 text-[14px] leading-relaxed text-slate">
                Get early access to Voxlate Digital and experience seamless real-time conversations across languages.
              </p>
              <button
                type="button"
                className="text-link mt-3 text-[15px]"
                onClick={() => {
                  window.dispatchEvent(new Event("review:open-form"));
                  document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                Leave a Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
