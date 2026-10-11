"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DemoCard } from "@/components/sections/digital/DemoCard";
import { ReviewBanner } from "@/components/sections/digital/ReviewBanner";

export default function DemoPageClient() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="pb-20 md:pb-28">
        <div className="page-container pb-8 pt-12 md:pb-10 md:pt-16">
          <span className="status-tag">Demo Experience</span>
          <h1 className="display-page mt-5">
            Experience <em className="italic">Voxlate</em>
          </h1>
          <p className="lead mt-4">
            We&apos;re building real-time AI translation designed to preserve your original voice, tone and emotion.
          </p>
          <div className="mt-6 grid max-w-[900px] gap-4 text-[15px] leading-relaxed text-slate md:grid-cols-2 md:gap-8">
            <div>
              <h2 className="text-[15px] font-semibold text-ink">This is a Demo Environment</h2>
              <p className="mt-1">
                Test how your voice sounds in another language. Our AI will translate your recorded speech and generate
                audio, aiming to preserve your original voice, tone &amp; emotion.
              </p>
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-ink">This is just a demo to help you feel the experience.</h2>
              <p className="mt-1">
                It gives you a preview of how the other person will hear you in their language. Record a short clip, stop,
                and it&apos;s sent for processing — it isn&apos;t live call translation.
              </p>
            </div>
          </div>
        </div>
        <DemoCard />
        <ReviewBanner />
      </main>
      <Footer />
    </div>
  );
}
