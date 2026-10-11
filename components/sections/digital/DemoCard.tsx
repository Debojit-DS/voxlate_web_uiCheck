"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, RotateCcw, Loader2, Lock, TriangleAlert } from "lucide-react";
import { useDemoGate } from "@/components/auth/useDemoGate";
import { useWaitlistModal } from "@/components/waitlist/WaitlistModalProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAuthPrompt } from "@/components/auth/AuthPromptProvider";
import { Button } from "@/components/ui/Button";
import { LanguageSelect } from "@/components/ui/LanguageSelect";
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

  const { isAllowed, isLoading: isGateLoading, promptJoinWaitlist } = useDemoGate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { openPrompt } = useAuthPrompt();
  const { openModal } = useWaitlistModal();
  const router = useRouter();
  const searchParams = useSearchParams();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

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

  // Release the microphone, socket and audio URL when leaving the page.
  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
      wsRef.current?.close();
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
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        sendAudioToServer(new Blob(audioChunksRef.current, { type: "audio/webm" }));
      };

      recorder.start();
      setElapsed(0);
      setPhase("recording");
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setPhase("denied");
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

  const sendAudioToServer = (audioBlob: Blob) => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/ws";
    const targetLanguage = language;
    let settled = false;
    const settle = (next: Phase, detail = "") => {
      if (settled) return;
      settled = true;
      setErrorDetail(detail);
      setPhase(next);
    };

    let ws: WebSocket;
    try {
      ws = new WebSocket(wsUrl);
    } catch {
      settle("disconnected");
      return;
    }
    wsRef.current = ws;
    ws.binaryType = "arraybuffer";

    ws.onopen = () => {
      const email = user?.email || "demo@example.com";
      ws.send(`email: ${email}`);
    };

    ws.onmessage = async (event) => {
      if (typeof event.data !== "string") return;
      if (event.data === "permitted") {
        const buffer = await audioBlob.arrayBuffer();
        ws.send(buffer);
        ws.send(`lang: ${LANGUAGE_MAP[targetLanguage]}`);
      } else if (event.data === "denied") {
        settle("quota");
        ws.close();
      } else if (event.data === "error") {
        settle("error", "The translation service couldn't process this recording.");
      } else if (event.data.trim().startsWith("{")) {
        try {
          const payload = JSON.parse(event.data);
          if (payload.status === "success") {
            setOriginalText(payload.original_text);
            setTranslatedText(payload.translated_text);
            setResultLanguage(targetLanguage);

            const byteCharacters = atob(payload.audio_base64);
            const byteArray = new Uint8Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteArray[i] = byteCharacters.charCodeAt(i);
            }
            setAudioUrl(URL.createObjectURL(new Blob([byteArray], { type: "audio/wav" })));
            settle("result");
          } else {
            settle("error", "The translation service returned an unexpected response.");
          }
        } catch (e) {
          console.error("Failed to parse server message:", e);
          settle("error", "The translation service returned an unreadable response.");
        }
      }
    };

    ws.onerror = () => settle("disconnected");
    ws.onclose = () => settle("disconnected");
  };

  const busy = phase === "permission" || phase === "recording" || phase === "processing";
  const gate: "ok" | "checking" | "signin" | "join" = isAuthLoading || (user && isGateLoading)
    ? "checking"
    : !user
      ? "signin"
      : !isAllowed
        ? "join"
        : "ok";

  const statusText: Record<Phase, string> = {
    idle: "Tap the microphone and start speaking. Press Stop when you’ve finished.",
    permission: "Allow microphone access in your browser to continue.",
    denied: "Microphone access was blocked. Allow it in your browser’s site settings, then try again.",
    recording: "Listening… tap Stop when you’ve finished speaking.",
    processing: "Recording sent. Translating and generating voice… this can take several seconds.",
    result: "Translation ready.",
    error: errorDetail || "Something went wrong while processing your recording.",
    disconnected: "Couldn’t reach the translation service. It may be offline — please try again later.",
    quota: `You’ve reached the demo limit for this account (${DEMO_LIMIT} translations).`,
  };
  const isProblem = phase === "denied" || phase === "error" || phase === "disconnected" || phase === "quota";

  return (
    <section aria-labelledby="demo-tool-title" className="page-container">
      <h2 id="demo-tool-title" className="sr-only">Translation tool</h2>
      <div className="rounded-[18px] border border-line bg-surface">
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
              <div className="mt-6 rounded-[12px] bg-mist p-5">
                {gate === "checking" ? (
                  <p className="flex items-center gap-2 text-[15px] text-ink" role="status">
                    <Loader2 size={16} className="animate-spin" aria-hidden /> Checking demo access…
                  </p>
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
                      className="inline-flex h-14 items-center gap-3 rounded-[12px] bg-ink px-6 text-[16px] font-semibold text-white transition-colors hover:bg-[#0f1d28]"
                    >
                      <Square size={16} fill="currentColor" aria-hidden />
                      Stop recording
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={phase === "result" ? () => { resetResult(); setPhase("idle"); } : startRecording}
                      disabled={phase === "permission" || phase === "processing" || phase === "quota"}
                      className="inline-flex h-14 items-center gap-3 rounded-[12px] bg-primary px-6 text-[16px] font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
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
