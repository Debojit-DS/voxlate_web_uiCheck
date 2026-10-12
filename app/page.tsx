import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { DesktopPreview } from "@/components/sections/DesktopPreview";
import { EarlyTesterBanner } from "@/components/sections/EarlyTesterBanner";
import { FAQSection } from "@/components/sections/FAQSection";
import { UnderlineLink } from "@/components/ui/UnderlineLink";
import { WaitlistButton } from "@/components/waitlist/WaitlistButton";

export const metadata = {
  title: "Voxlate — Breaking Language Barriers",
  description: "Real-time AI translation designed to preserve your voice, tone and emotion. Join the waitlist for early access.",
  openGraph: {
    title: "Voxlate — Breaking Language Barriers",
    description: "Real-time AI translation designed to preserve your voice, tone and emotion.",
    type: "website",
  },
};

// TrustStrip topics, kept as goals (REDESIGN_CONTENT_MAP.md C4–C6).
const GOALS = [
  { label: "Real-Time Translation" },
  { label: "Original Voice Preserved", note: "in development" },
  { label: "Secure & Private", note: "a design goal" },
  { label: "100+ Languages", note: "long-term goal" },
  { label: "Natural Conversations" },
];

export default function Page() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />

        {/* What is Voxlate? — paired with the planned desktop experience */}
        <section id="about" aria-labelledby="what-title" className="border-t border-line bg-mist/60 py-16 md:py-24">
          <div className="page-container grid items-center gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
            <div>
              <h2 id="what-title" className="display-section">What is Voxlate?</h2>
              <p className="mt-5 max-w-[56ch] text-[17px] leading-relaxed text-slate md:text-[18px]">
                Voxlate is an AI-powered communication platform designed to eliminate language barriers while preserving
                the speaker&apos;s natural voice, tone, and emotions. Whether online or face-to-face, the goal is for
                conversations to feel natural without requiring anyone to learn a new language.
              </p>
              <div className="mt-8 border-t border-line pt-5">
                <p className="text-[13px] font-medium text-slate">What we&apos;re building toward</p>
                <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[15px] text-ink">
                  {GOALS.map((g) => (
                    <li key={g.label}>
                      {g.label}
                      {g.note && <span className="text-slate"> — {g.note}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <DesktopPreview />
          </div>
        </section>

        {/* Our Products */}
        <section id="products" aria-labelledby="products-title" className="py-16 md:py-24">
          <div className="page-container">
            <h2 id="products-title" className="display-section">Our Products</h2>

            <article className="mt-10 grid gap-8 border-y border-line py-8 sm:py-10 md:grid-cols-[1.3fr_1fr] md:items-center">
              <div>
                <p className="flex flex-wrap items-center gap-3">
                  <span className="eyebrow">Digital Version</span>
                  <span className="status-tag">In development · Windows first</span>
                </p>
                <h3 className="mt-4 font-display text-[34px] leading-tight text-ink md:text-[42px]">One Meeting. Every Language.</h3>
                <p className="mt-3 max-w-[48ch] text-[17px] leading-relaxed text-slate">
                  Perfect for freelancers, IT companies, BPOs, online meetings and global teams.
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-4">
                  <WaitlistButton source="digital-card" label="Join Waitlist" />
                  <UnderlineLink href="/digital-version" variant="goes-out-comes-in" direction="right" className="text-[15px] font-semibold">
                    See Details
                  </UnderlineLink>
                  <UnderlineLink href="/demo" variant="goes-out-comes-in" direction="right" className="text-[15px] font-semibold">
                    View Our Demo
                  </UnderlineLink>
                </div>
              </div>
              <dl className="grid gap-px overflow-hidden rounded-[6px] border border-line bg-line text-[15px]">
                {[
                  ["Today", "Recorded-clip web demo"],
                  ["First pilot", "Hindi ↔ English, both directions"],
                  ["Planned meeting apps", "Zoom, Google Meet, Teams"],
                ].map(([term, value]) => (
                  <div key={term} className="flex flex-col gap-1 bg-page px-5 py-4 sm:flex-row sm:justify-between sm:gap-6">
                    <dt className="text-slate">{term}</dt>
                    <dd className="font-medium text-ink sm:text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            </article>

            <article className="grid items-center gap-8 border-b border-line py-8 sm:py-10 md:grid-cols-[1.3fr_1fr]">
              <div>
                <p className="flex flex-wrap items-center gap-3">
                  <span className="eyebrow">Physical Version</span>
                  <span className="status-tag">Concept · in development</span>
                </p>
                <h3 className="mt-4 font-display text-[30px] leading-tight text-ink md:text-[34px]">Real Conversations. No Language Barrier.</h3>
                <p className="mt-3 max-w-[48ch] text-[17px] leading-relaxed text-slate">
                  Designed for tourists, classrooms, seminars and face-to-face communication.
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-4">
                  <WaitlistButton source="physical-card" label="Join Waitlist" />
                  <UnderlineLink href="/physical-version" variant="goes-out-comes-in" direction="right" className="text-[15px] font-semibold">
                    See Details
                  </UnderlineLink>
                </div>
              </div>
              <figure className="mx-auto w-full max-w-[280px]">
                <Image
                  src="/images/physical/hero-device.png"
                  alt="Concept rendering of the Voxlate Physical earpiece"
                  width={2048}
                  height={2062}
                  sizes="280px"
                  className="h-auto w-full rounded-[6px] bg-mist"
                />
                <figcaption className="mt-2 text-center text-[13px] text-slate">Concept rendering</figcaption>
              </figure>
            </article>
          </div>
        </section>

        <EarlyTesterBanner source="tester-banner" />
        <FAQSection />
      </main>
      <Footer />
    </>
  );
}
