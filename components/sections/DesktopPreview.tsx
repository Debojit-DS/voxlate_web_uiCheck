"use client";

import { ArrowRight, Headphones, Mic, Minus, X } from "lucide-react";
import { useId, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { LanguageSelect } from "@/components/ui/LanguageSelect";
import { DEMO_LANGUAGE_NAMES } from "@/lib/demoLanguages";

const MICROPHONES = ["USB headset microphone", "Built-in microphone", "Default system microphone"];
const OUTPUTS = ["USB headphones", "Built-in speakers", "Default system output"];

function Direction({ label, from, to, outgoing }: { label: string; from: string; to: string; outgoing?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${outgoing ? "text-primary" : "text-ink"}`}>
        {label}
      </span>
      <span className="flex items-center gap-2 text-[14px] text-ink">
        {from}
        <ArrowRight size={14} className={outgoing ? "text-primary" : "text-slate"} />
        <span className={outgoing ? "rounded-[6px] bg-primary px-2 py-0.5 text-white" : "rounded-[6px] bg-mist px-2 py-0.5"}>
          {to}
        </span>
      </span>
    </div>
  );
}

/** Interactive concept of the planned Windows app; all choices are preview-only. */
export function DesktopPreview() {
  const id = useId();
  const [microphone, setMicrophone] = useState(MICROPHONES[0]);
  const [output, setOutput] = useState(OUTPUTS[0]);
  const [myLanguage, setMyLanguage] = useState("Hindi");
  const [meetingLanguage, setMeetingLanguage] = useState("English");
  const [useVoice, setUseVoice] = useState(false);

  return (
    <figure className="mx-auto w-full max-w-[640px]">
      <div
        role="group"
        aria-label="Planned desktop app preview"
        aria-describedby={`${id}-note`}
        className="relative rounded-[10px] border border-line bg-surface shadow-[0_30px_60px_-30px_rgb(24_43_58/0.28)]"
      >
        <div className="flex items-center justify-between rounded-t-[10px] border-b border-line bg-page px-4 py-2.5">
          <span className="flex items-center gap-2 text-[13px] font-semibold text-ink">
            <Logo className="h-5 w-auto" />
            Voxlate
          </span>
          <span className="flex gap-3 text-[13px] text-slate" aria-hidden="true">
            <span>Settings</span>
            <Minus size={14} />
            <X size={14} />
          </span>
        </div>

        <div className="space-y-5 p-5 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-sans text-[24px] font-medium leading-tight text-ink" aria-live="polite">{myLanguage} ↔ {meetingLanguage}</p>
              <p className="mt-1.5 text-[13px] text-slate">Not started</p>
            </div>
            <button type="button" disabled aria-describedby={`${id}-note`} className="shrink-0 cursor-not-allowed rounded-[4px] bg-primary px-5 py-2 text-[14px] font-semibold text-white opacity-60">Start</button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <LanguageSelect id={`${id}-microphone`} label="My microphone" value={microphone} options={MICROPHONES} onChange={setMicrophone} icon={<Mic size={16} className="shrink-0 text-slate" aria-hidden />} />
            <LanguageSelect id={`${id}-output`} label="I hear audio through" value={output} options={OUTPUTS} onChange={setOutput} icon={<Headphones size={16} className="shrink-0 text-slate" aria-hidden />} />
            <LanguageSelect id={`${id}-my-language`} label="My language" value={myLanguage} options={DEMO_LANGUAGE_NAMES} onChange={setMyLanguage} />
            <LanguageSelect id={`${id}-meeting-language`} label="Meeting language" value={meetingLanguage} options={DEMO_LANGUAGE_NAMES} onChange={setMeetingLanguage} />
          </div>

          <div className="flex items-center justify-between rounded-[6px] bg-page px-4 py-3">
            <div>
              <p id={`${id}-voice-label`} className="text-[14px] font-medium text-ink">Use my voice</p>
              <p className="text-[12px] text-slate">{useVoice ? "Personal voice selected in preview" : "Generic voice selected"}</p>
            </div>
            <button type="button" role="switch" aria-checked={useVoice} aria-labelledby={`${id}-voice-label`} onClick={() => setUseVoice((value) => !value)} className="flex min-h-11 min-w-11 shrink-0 items-center justify-center">
              <span className={`relative h-6 w-10 rounded-[3px] border ${useVoice ? "border-primary bg-primary" : "border-line-strong bg-surface"}`} aria-hidden="true">
                <span className={`absolute left-1 top-1 h-3.5 w-3.5 rounded-[3px] transition-transform motion-reduce:transition-none ${useVoice ? "translate-x-4 bg-white" : "bg-line-strong"}`} />
              </span>
            </button>
          </div>

          <div className="divide-y divide-line border-y border-line">
            <Direction label="You → meeting" from={myLanguage} to={meetingLanguage} outgoing />
            <Direction label="Meeting → you" from={meetingLanguage} to={myLanguage} />
          </div>

          <p className="text-[13px] leading-relaxed text-slate">
            In the meeting app, choose <span className="font-medium text-ink">Voxlate Microphone</span> and{" "}
            <span className="font-medium text-ink">Voxlate Speaker</span>.
          </p>
        </div>
      </div>
      <figcaption className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-[13px] text-slate">
        <span className="status-tag">Planned desktop experience</span>
        <span>Concept illustration of the Windows app in development — not a screenshot.</span>
        <span id={`${id}-note`}>Try the selectors with sample devices. This preview does not capture audio or start translation.</span>
      </figcaption>
    </figure>
  );
}
