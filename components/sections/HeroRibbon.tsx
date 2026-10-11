"use client";

import { useEffect, useRef, useState } from "react";
import { DEMO_LANGUAGES } from "@/lib/demoLanguages";

/** Illustrative vocabulary. Real words with accurate translations; fixed order. */
const ORIGINAL_WORDS = [
  { language: "Hindi", lang: "hi", source: "नमस्ते", english: "Hello" },
  { language: "Bengali", lang: "bn", source: "বন্ধু", english: "Friend" },
  { language: "Tamil", lang: "ta", source: "நன்றி", english: "Thanks" },
  { language: "Telugu", lang: "te", source: "స్వాగతం", english: "Welcome" },
  { language: "Gujarati", lang: "gu", source: "શાંતિ", english: "Peace" },
  { language: "Kannada", lang: "kn", source: "ಕನಸು", english: "Dream" },
] as const;

// Retain the selected Indian-language sequence, then include every other demo target.
export const RIBBON_WORDS = [
  ...ORIGINAL_WORDS,
  ...DEMO_LANGUAGES.filter((word) => !ORIGINAL_WORDS.some((original) => original.lang === word.lang)),
];

type Geometry = {
  viewBox: [number, number];
  preserve: string;
  incoming: string;
  outgoing: string;
  capsule: { x: number; y: number; w: number; h: number };
  sourceSize: number;
  englishSize: number;
  ribbonWidth: number;
  gap: number;
  /** ViewBox units per second; fixed speed keeps the expanded sequence readable. */
  speed: number;
};

const WIDE: Geometry = {
  viewBox: [1440, 280],
  preserve: "xMidYMid meet",
  // Soft loop from the lower-left edge into the capsule at lower centre.
  incoming: "M -60 244 C 110 244 222 204 262 136 C 300 70 236 28 178 50 C 116 74 150 164 296 202 C 430 234 568 222 720 220",
  // Solid blue ribbon rising to the right.
  outgoing: "M 720 220 C 900 220 1080 194 1222 146 C 1322 112 1410 90 1520 74",
  capsule: { x: 720, y: 220, w: 172, h: 64 },
  sourceSize: 26,
  englishSize: 21,
  ribbonWidth: 44,
  gap: 70,
  speed: 40,
};

const COMPACT: Geometry = {
  viewBox: [400, 160],
  preserve: "xMidYMid meet",
  // Shallow left-to-right path for small screens.
  incoming: "M -40 76 C 70 72 118 120 200 120",
  outgoing: "M 200 120 C 268 120 330 100 440 78",
  capsule: { x: 200, y: 120, w: 84, h: 36 },
  sourceSize: 16,
  englishSize: 13,
  ribbonWidth: 26,
  gap: 26,
  speed: 18,
};

type Item = { source: string; english: string; lang?: string };
const ITEMS: Item[] = RIBBON_WORDS.flatMap((w) => [
  { source: w.source, english: w.english, lang: w.lang },
  { source: "·", english: "·" },
]);

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const WAVE_BARS = [0.35, 0.6, 0.9, 0.5, 1, 0.7, 0.4, 0.8, 0.55, 0.3, 0.65, 0.45];

/**
 * Many languages in, English out. Words travel one path at constant speed;
 * each source word fades out as it reaches the capsule and its English word
 * fades in at the exit, so order and mapping never change. Positions are
 * written straight to the SVG each frame — React renders the words once.
 */
export function HeroRibbon({ running, compact }: { running: boolean; compact: boolean }) {
  const g = compact ? COMPACT : WIDE;
  const inPath = useRef<SVGPathElement>(null);
  const outPath = useRef<SVGPathElement>(null);
  const measureSrc = useRef<(SVGTextElement | null)[]>([]);
  const measureEn = useRef<(SVGTextElement | null)[]>([]);
  const srcEls = useRef<(SVGTextElement | null)[]>([]);
  const enEls = useRef<(SVGTextElement | null)[]>([]);
  const waveEls = useRef<(SVGRectElement | null)[]>([]);
  const waveTime = useRef(0);
  const pos = useRef<number | null>(null);
  const [layout, setLayout] = useState<{
    copies: number;
    span: number;
    sMin: number;
    lin: number;
    centers: number[];
    cycle: number;
    srcW: number[];
    enW: number[];
  } | null>(null);

  // Measure path lengths and real word widths (after the script fonts load).
  useEffect(() => {
    let cancelled = false;
    const measure = () => {
      if (cancelled || !inPath.current || !outPath.current) return;
      const srcW = ITEMS.map((_, i) => measureSrc.current[i]?.getComputedTextLength() ?? 0);
      const enW = ITEMS.map((_, i) => measureEn.current[i]?.getComputedTextLength() ?? 0);
      const slot = ITEMS.map((_, i) => Math.max(srcW[i], enW[i]));
      const centers: number[] = [];
      let c = 0;
      ITEMS.forEach((_, i) => {
        if (i > 0) c += slot[i - 1] / 2 + g.gap / 2 + slot[i] / 2;
        centers.push(c);
      });
      const cycle = c + slot[ITEMS.length - 1] / 2 + g.gap / 2 + slot[0] / 2;
      const lin = inPath.current.getTotalLength();
      const lout = outPath.current.getTotalLength();
      const pad = Math.max(...slot) + 40;
      const copies = Math.ceil((lin + lout + 2 * pad) / cycle);
      setLayout({ copies, span: copies * cycle, sMin: -lin - pad, lin, centers, cycle, srcW, enW });
    };
    measure();
    document.fonts?.ready.then(measure);
    document.fonts?.addEventListener("loadingdone", measure);
    return () => {
      cancelled = true;
      document.fonts?.removeEventListener("loadingdone", measure);
    };
  }, [g]);

  // Draw loop.
  useEffect(() => {
    if (!layout) return;
    const capHalf = g.capsule.w / 2;
    if (pos.current === null) pos.current = -(capHalf + layout.srcW[0] / 2 + 140);

    const draw = () => {
      // Share the ribbon's clock so pausing/offscreen suspension freezes both.
      WAVE_BARS.forEach((bar, i) => {
        const amplitude = 0.72 + 0.28 * Math.sin(waveTime.current * 3.8 + i * 0.8);
        const height = g.capsule.h * 0.55 * bar * amplitude;
        waveEls.current[i]?.setAttribute("height", String(height));
        waveEls.current[i]?.setAttribute("y", String(g.capsule.y - height / 2));
      });
      const p = pos.current ?? 0;
      for (let k = 0; k < layout.copies; k++) {
        for (let j = 0; j < ITEMS.length; j++) {
          const idx = k * ITEMS.length + j;
          const raw = p - layout.centers[j] - k * layout.cycle;
          const s = ((((raw - layout.sMin) % layout.span) + layout.span) % layout.span) + layout.sMin;
          const src = srcEls.current[idx];
          const en = enEls.current[idx];
          if (src) {
            src.firstElementChild?.setAttribute("startOffset", String(layout.lin + s));
            src.style.opacity = String(clamp01((-s - capHalf - layout.srcW[j] / 2 - 6) / 30));
          }
          if (en) {
            en.firstElementChild?.setAttribute("startOffset", String(s));
            en.style.opacity = String(clamp01((s - capHalf - layout.enW[j] / 2 - 6) / 30));
          }
        }
      }
    };

    draw();
    if (!running) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      pos.current = (pos.current ?? 0) + dt * g.speed;
      waveTime.current += dt;
      draw();
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [layout, running, g]);

  const [vw, vh] = g.viewBox;
  const { x, y, w, h } = g.capsule;
  const copies = layout?.copies ?? 0;

  return (
    <svg
      viewBox={`0 0 ${vw} ${vh}`}
      preserveAspectRatio={g.preserve}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <path id="ribbon-in" ref={inPath} d={g.incoming} fill="none" />
        <path id="ribbon-out" ref={outPath} d={g.outgoing} fill="none" />
      </defs>

      {/* Measurement only */}
      <g visibility="hidden">
        {ITEMS.map((item, i) => (
          <text key={`ms${i}`} ref={(el) => { measureSrc.current[i] = el; }} className="ribbon-source" fontSize={g.sourceSize} lang={item.lang}>
            {item.source}
          </text>
        ))}
        {ITEMS.map((item, i) => (
          <text key={`me${i}`} ref={(el) => { measureEn.current[i] = el; }} className="ribbon-target" fontSize={g.englishSize}>
            {item.english}
          </text>
        ))}
      </g>

      <use href="#ribbon-out" stroke="var(--color-primary)" strokeWidth={g.ribbonWidth} strokeLinecap="round" fill="none" />

      {Array.from({ length: copies }).flatMap((_, k) =>
        ITEMS.map((item, j) => {
          const idx = k * ITEMS.length + j;
          return (
            <g key={`${k}-${j}`}>
              <text
                ref={(el) => { srcEls.current[idx] = el; }}
                className="ribbon-source"
                fontSize={g.sourceSize}
                textAnchor="middle"
                dy="0.35em"
                lang={item.lang}
                style={{ opacity: 0, direction: item.lang === "ar" ? "rtl" : "ltr", unicodeBidi: "isolate" }}
              >
                <textPath href="#ribbon-in" startOffset="0">{item.source}</textPath>
              </text>
              <text
                ref={(el) => { enEls.current[idx] = el; }}
                className="ribbon-target"
                fontSize={g.englishSize}
                textAnchor="middle"
                dy="0.35em"
                style={{ opacity: 0 }}
              >
                <textPath href="#ribbon-out" startOffset="0">{item.english}</textPath>
              </text>
            </g>
          );
        }),
      )}

      {/* Decorative oscillation, synchronized with the illustration's pause state. */}
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={h / 2} fill="#FFFFFF" stroke="var(--color-ink)" strokeWidth={compact ? 1.5 : 2} />
      {WAVE_BARS.map((b, i) => {
        const bw = w * 0.032;
        const spacing = (w * 0.62) / (WAVE_BARS.length - 1);
        const bx = x - w * 0.31 + i * spacing;
        const bh = h * 0.55 * b;
        return <rect key={i} ref={(el) => { waveEls.current[i] = el; }} x={bx - bw / 2} y={y - bh / 2} width={bw} height={bh} rx={bw / 2} fill="var(--color-ink)" />;
      })}
    </svg>
  );
}
