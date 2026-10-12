"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { TypewriterText } from "@/components/ui/TypewriterText";
import { UnderlineLink } from "@/components/ui/UnderlineLink";
import { useGatedWaitlist } from "@/components/auth/useGatedWaitlist";
import { TutorialButton } from "@/components/waitlist/TutorialButton";
import { HeroRibbon, RIBBON_WORDS } from "./HeroRibbon";
import { DEVELOPMENT_MESSAGE } from "@/lib/productCopy";
import styles from "./Hero.module.css";

const PHRASES = ["Speak Naturally.", "Hear Every Language."];

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState<boolean | null>(null);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [query]);
  return matches;
}

export function Hero() {
  const { openWaitlist } = useGatedWaitlist();
  const sectionRef = useRef<HTMLElement>(null);
  const [onScreen, setOnScreen] = useState(true);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const compact = useMediaQuery("(max-width: 899px)");

  // Stop all hero animation work while the section is off screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // null = not hydrated yet (or no JS): show the static pairs instead of the artwork.
  const motionReady = reduced === false && compact !== null;
  const running = motionReady && onScreen;

  return (
    <section ref={sectionRef} aria-labelledby="hero-title" className={styles.hero}>
      <div className={`page-container ${styles.content}`}>
        <p className="eyebrow">Voxlate · Early access</p>
        <h1 id="hero-title" className={`${styles.title} font-display font-normal text-ink`}>
          Breaking Language <em className="block italic">Barriers.</em>
        </h1>

        <p className={`${styles.tagline} font-medium text-primary`}>
          <span className="sr-only">Speak Naturally. Hear Every Language.</span>
          <TypewriterText phrases={PHRASES} speed={70} waitTime={1800} deleteSpeed={40} cursorChar="_" paused={!running} />
        </p>

        <p className={`${styles.description} text-slate`}>
          We&apos;re building real-time AI translation designed to preserve your original voice, tone and emotion.
        </p>

        <div className={styles.actions}>
          <Button onClick={() => openWaitlist("hero")} wide>
            Join Waitlist
          </Button>
          <UnderlineLink href="/demo" variant="goes-out-comes-in" direction="right" className="text-[15px] font-semibold">
            View Our Demo
          </UnderlineLink>
          <TutorialButton label="Watch Tutorial" />
        </div>
        <p className={`${styles.invitation} text-slate`}>
          {DEVELOPMENT_MESSAGE}
        </p>
      </div>

      <figure className={styles.ribbonFigure} aria-labelledby="ribbon-caption">
        <p id="ribbon-description" className="sr-only">
          Illustration: words in {RIBBON_WORDS.map((word) => word.language).join(", ")} flow one after another into a
          Voxlate capsule and come out as English.
        </p>
        <div className={`${styles.ribbonStage} ${motionReady ? "" : styles.staticStage}`}>
          {motionReady && <HeroRibbon running={running} compact={!!compact} />}
          <ul
            className={
              motionReady
                ? "sr-only"
                : styles.fallback
            }
          >
            {RIBBON_WORDS.map((w) => (
              <li
                key={w.lang}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-surface py-1.5 pl-4 pr-1.5 text-[15px]"
              >
                <span lang={w.lang} dir={w.lang === "ar" ? "rtl" : "ltr"} className="font-[family-name:var(--font-indic)] text-ink">
                  {w.source}
                </span>
                <span className="sr-only"> ({w.language}) means </span>
                <span aria-hidden="true" className="text-slate">→</span>
                <span className="rounded-full bg-primary px-3 py-0.5 font-medium text-white">{w.english}</span>
              </li>
            ))}
          </ul>
        </div>
        <figcaption className={`page-container ${styles.caption}`}>
          <span id="ribbon-caption" className={`${styles.captionLabel} text-slate`}>
            Illustrative translation
          </span>

        </figcaption>
      </figure>
    </section>
  );
}
