"use client";

import { useEffect, useRef } from "react";

type Props = {
  phrases: string[];
  /** Typing interval in ms. */
  speed?: number;
  initialDelay?: number;
  /** Hold time before deleting a finished phrase. */
  waitTime?: number;
  deleteSpeed?: number;
  loop?: boolean;
  showCursor?: boolean;
  hideCursorOnType?: boolean;
  cursorChar?: string;
  /** Stops typing and cursor blinking (hero pause, off-screen, reduced motion). */
  paused?: boolean;
  className?: string;
};

const segmenter =
  typeof Intl !== "undefined" && "Segmenter" in Intl ? new Intl.Segmenter(undefined, { granularity: "grapheme" }) : null;
const graphemes = (s: string) => (segmenter ? Array.from(segmenter.segment(s), (g) => g.segment) : Array.from(s));

/**
 * React port of the selected TypewriterText reference. The first phrase is
 * rendered complete on the server, so the line is meaningful before hydration.
 * Glyph updates go straight to the DOM (no re-render per character); the
 * animated span is hidden from assistive tech — callers supply a stable sentence.
 */
export function TypewriterText({
  phrases,
  speed = 70,
  initialDelay = 0,
  waitTime = 1500,
  deleteSpeed = 40,
  loop = true,
  showCursor = true,
  hideCursorOnType = false,
  cursorChar = "_",
  paused = false,
  className = "",
}: Props) {
  const textRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  // Progress survives pause/resume.
  const state = useRef({ phrase: 0, length: graphemes(phrases[0]).length, deleting: false, started: false });

  useEffect(() => {
    if (paused || phrases.length < 2) return;
    let timer: ReturnType<typeof setTimeout>;
    const s = state.current;

    const render = (typing: boolean) => {
      if (textRef.current) textRef.current.textContent = graphemes(phrases[s.phrase]).slice(0, s.length).join("");
      if (cursorRef.current) cursorRef.current.style.visibility = hideCursorOnType && typing ? "hidden" : "";
    };

    const step = () => {
      const full = graphemes(phrases[s.phrase]).length;
      if (!s.deleting && s.length >= full) {
        if (!loop && s.phrase === phrases.length - 1) return;
        s.deleting = true;
        timer = setTimeout(step, waitTime);
        return;
      }
      if (s.deleting) {
        s.length -= 1;
        if (s.length <= 0) {
          s.length = 0;
          s.deleting = false;
          s.phrase = (s.phrase + 1) % phrases.length;
        }
        render(true);
        timer = setTimeout(step, s.length === 0 ? speed * 3 : deleteSpeed);
        return;
      }
      s.length += 1;
      render(true);
      timer = setTimeout(step, s.length >= full ? 0 : speed);
    };

    const firstDelay = s.started ? speed : initialDelay + waitTime;
    s.started = true;
    timer = setTimeout(step, firstDelay);
    return () => clearTimeout(timer);
  }, [paused, phrases, speed, initialDelay, waitTime, deleteSpeed, loop, hideCursorOnType]);

  const longest = phrases.reduce((a, b) => (b.length > a.length ? b : a), "");

  return (
    <span className={`inline-grid ${className}`} aria-hidden="true">
      {/* Reserves the widest phrase so typing never shifts nearby layout. */}
      <span className="invisible col-start-1 row-start-1 whitespace-nowrap">
        {longest}
        {showCursor && cursorChar}
      </span>
      <span className="col-start-1 row-start-1 whitespace-nowrap">
        <span ref={textRef}>{phrases[0]}</span>
        {showCursor && (
          <span
            ref={cursorRef}
            className={`motion-safe:animate-[tw-blink_1s_steps(1)_infinite] motion-reduce:hidden ${
              paused ? "[animation-play-state:paused]" : ""
            }`}
          >
            {cursorChar}
          </span>
        )}
      </span>
    </span>
  );
}
