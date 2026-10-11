import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WaitlistButton } from "@/components/waitlist/WaitlistButton";

export const metadata = {
  title: "Voxlate Physical — Real World. Real Conversations.",
  description:
    "Voxlate Physical is a wearable translation device in development, designed to let you hear and speak in your own language, in real time. No apps, no typing — just natural conversations.",
  openGraph: {
    title: "Voxlate Physical — Real World. Real Conversations.",
    description:
      "Voxlate Physical is a wearable translation device in development, designed to let you hear and speak in your own language, in real time. No apps, no typing — just natural conversations.",
    type: "website",
  },
};

const HERO_POINTS = [
  "Hear any language in your language in real time.",
  "Designed to preserve your original voice, tone & emotion.",
  "Communicate naturally, anywhere, anytime.",
];

const SITUATIONS = [
  { label: "Tourists", src: "/images/physical/situations/tourists.png", alt: "Tourists interacting with locals on a street", w: 2496, h: 1728 },
  { label: "Students", src: "/images/physical/situations/students.png", alt: "Students collaborating at a table", w: 2480, h: 1728 },
  { label: "Business Meetings", src: "/images/physical/situations/business-meeting.png", alt: "Four people at a boardroom table in a meeting", w: 2498, h: 1696 },
  { label: "Seminars & Conferences", src: "/images/physical/situations/seminar.png", alt: "Presenter addressing a seated audience", w: 2528, h: 1694 },
  { label: "Markets & Shopping", src: "/images/physical/situations/market.png", alt: "People interacting at a market stall", w: 2528, h: 1688 },
  { label: "Travel & Airports", src: "/images/physical/situations/travel.png", alt: "Two people with luggage at an airport terminal", w: 2472, h: 1696 },
];

const STEPS = ["Wear Voxlate Device", "Choose Your Language", "Talk Naturally", "Hear Translation"];

const MODES = [
  {
    name: "P2E — Person to Environment",
    badge: "Auto-connect within 2 m — unverified design target",
    image: { src: "/images/physical/modes/p2e.png", alt: "Illustration: two people wearing Voxlate devices talking within about two metres", w: 2582, h: 1664 },
    intro: "Perfect for dynamic, one-to-one or small group conversations in daily life.",
    items: [
      "Auto-connects to any Voxlate device within 2 meters (planned · unverified)",
      "No manual pairing required (planned · unverified)",
      "Ideal for tourists, shopping, offices, campuses & casual conversations",
    ],
  },
  {
    name: "P2P — Person to Person",
    badge: "Connect 2 to 200 people — unverified design target",
    image: { src: "/images/physical/modes/p2p.png", alt: "Illustration: a presenter connected to several listeners wearing Voxlate devices", w: 2468, h: 1696 },
    intro: "Designed for structured group communication like classrooms, seminars & events.",
    items: [
      "Connect 2 to 200 participants at once (unverified design target)",
      "Everyone hears in their own preferred language",
      "Ask questions, reply and understand everyone in real time",
    ],
  },
];

const FEATURES = [
  { label: "Real-time Translation" },
  { label: "Works Offline (Edge Processing)", note: "unverified design target" },
  { label: "Long Battery Life", note: "unverified design target" },
  { label: "Lightweight & Comfortable" },
  { label: "Secure & Private", note: "design goal" },
  { label: "Multi-Language Support" },
  { label: "One Device, Many Possibilities" },
];

const SPECS = [
  { label: "Battery Life", value: "Up to 8 Hours" },
  { label: "Standby Time", value: "Up to 48 Hours" },
  { label: "Charging Case", value: "Portable & Magnetic" },
  { label: "Connectivity", value: "Bluetooth 5.3" },
  { label: "Range", value: "Up to 10 Meters" },
  { label: "Weight", value: "Ultra Light" },
];

export default function PhysicalVersionPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section aria-labelledby="physical-title" className="pb-14 pt-14 md:pb-20 md:pt-20">
          <div className="page-container grid items-center gap-12 md:grid-cols-[1.15fr_1fr]">
            <div>
              <p className="flex flex-wrap items-center gap-3">
                <span className="eyebrow">Physical Version</span>
                <span className="status-tag">Concept · in development</span>
              </p>
              <h1 id="physical-title" className="display-page mt-5">
                Real World. <em className="italic">Real Conversations.</em>
              </h1>
              <div className="mt-6 max-w-[54ch] space-y-3 text-[17px] leading-relaxed text-slate">
                <p>
                  Voxlate Physical is a wearable translation device we&apos;re developing to let you{" "}
                  <span className="font-medium text-ink">hear and speak in your own language — in real time.</span>
                </p>
                <p>Designed for face-to-face communication in the real world. No apps. No typing. Just natural conversations.</p>
              </div>
              <ul className="mt-6 space-y-2 border-l-2 border-primary pl-4 text-[15px] text-ink">
                {HERO_POINTS.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <div className="mt-8">
                <WaitlistButton source="physical-version-hero" label="Join Waitlist" wide />
              </div>
              <p className="mt-5 text-[14px] text-slate">
                Join the waitlist today and get a chance to become one of our early product testers.
              </p>
            </div>
            <figure>
              <div className="overflow-hidden rounded-[18px] border border-line bg-mist">
                <Image
                  src="/images/physical/hero-device.png"
                  alt="Concept rendering of the Voxlate Physical wearable translation device"
                  width={2048}
                  height={2062}
                  sizes="(max-width: 768px) 100vw, 500px"
                  className="h-auto w-full"
                  priority
                />
              </div>
              <figcaption className="mt-3 text-[13px] text-slate">Concept rendering — not a photograph of working hardware.</figcaption>
            </figure>
          </div>
        </section>

        {/* Situations */}
        <section aria-labelledby="situations-title" className="border-t border-line bg-surface py-16 md:py-24">
          <div className="page-container">
            <h2 id="situations-title" className="display-section">Built for Real-Life Situations</h2>
            <ul className="mt-10 grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3">
              {SITUATIONS.map((s) => (
                <li key={s.label}>
                  <Image
                    src={s.src}
                    alt={s.alt}
                    width={s.w}
                    height={s.h}
                    sizes="(max-width: 768px) 50vw, 360px"
                    className="aspect-[3/2] h-auto w-full rounded-[12px] bg-mist object-cover"
                  />
                  <p className="mt-3 text-[15px] font-semibold text-ink">{s.label}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* How it works */}
        <section aria-labelledby="how-title" className="py-16 md:py-24">
          <div className="page-container">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <h2 id="how-title" className="display-section">How It Works</h2>
              <p className="text-[14px] text-slate">Proposed interaction · not yet built</p>
            </div>
            <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:items-start">
              <ol className="grid gap-px overflow-hidden rounded-[18px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
                {STEPS.map((step, i) => (
                  <li key={step} className="bg-surface p-5">
                    <span className="font-display text-[34px] leading-none text-primary">{i + 1}</span>
                    <p className="mt-3 text-[16px] font-semibold leading-snug text-ink">{step}</p>
                  </li>
                ))}
              </ol>
              <blockquote className="border-l-2 border-primary pl-5">
                <p lang="hi-Latn" className="font-display text-[22px] leading-snug text-ink">
                  “Sunne waale ko pata bhi nahi chalega ki aapko unki language aati bhi hai ya nahi.”
                </p>
                <p className="mt-3 text-[14px] text-slate">The goal: conversations that feel natural and effortless.</p>
              </blockquote>
            </div>
          </div>
        </section>

        {/* Communication modes */}
        <section aria-labelledby="modes-title" className="border-t border-line bg-mist/60 py-16 md:py-24">
          <div className="page-container">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <h2 id="modes-title" className="display-section">Communication Modes</h2>
              <p className="text-[14px] text-slate">Planned modes</p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {MODES.map((m) => (
                <article key={m.name} className="rounded-[18px] border border-line bg-surface p-6 sm:p-8">
                  <h3 className="text-[19px] font-semibold text-ink">{m.name}</h3>
                  <p className="mt-1 text-[13px] text-slate">{m.badge}</p>
                  <Image
                    src={m.image.src}
                    alt={m.image.alt}
                    width={m.image.w}
                    height={m.image.h}
                    sizes="(max-width: 768px) 100vw, 480px"
                    className="mt-5 h-auto w-full rounded-[12px] bg-mist"
                  />
                  <p className="mt-5 text-[16px] leading-relaxed text-slate">{m.intro}</p>
                  <ul className="mt-4 space-y-2 text-[15px] text-ink">
                    {m.items.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Why choose */}
        <section aria-labelledby="why-title" className="py-16 md:py-24">
          <div className="page-container grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 id="why-title" className="display-section">Why Choose Voxlate Physical?</h2>
              <ul className="mt-8 divide-y divide-line border-y border-line">
                {FEATURES.map((f) => (
                  <li key={f.label} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
                    <span className="text-[16px] font-medium text-ink">{f.label}</span>
                    {f.note && <span className="text-[13px] text-slate">{f.note}</span>}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-[19px] font-semibold text-ink">Specifications</h3>
              <p className="mt-2 text-[15px] text-slate">Design targets for the concept — not tested specifications.</p>
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-[15px]">
                  <thead>
                    <tr className="border-b border-ink text-[13px] text-slate">
                      <th scope="col" className="py-2 pr-4 font-medium">Topic</th>
                      <th scope="col" className="py-2 pr-4 font-medium">Target</th>
                      <th scope="col" className="py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {SPECS.map((s) => (
                      <tr key={s.label}>
                        <th scope="row" className="py-3 pr-4 font-medium text-ink">{s.label}</th>
                        <td className="py-3 pr-4 text-ink">{s.value}</td>
                        <td className="py-3 text-[13px] text-slate">Unverified design target</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-6 text-[14px] text-slate">
                The web demo translates recorded clips in a browser; it does not demonstrate this device.
              </p>
            </div>
          </div>
        </section>

        {/* Early tester */}
        <section aria-labelledby="physical-tester" className="border-t border-line bg-mist/60 py-16 md:py-20">
          <div className="page-container flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 id="physical-tester" className="display-section">Be an Early Tester</h2>
              <p className="mt-3 max-w-[56ch] text-[17px] leading-relaxed text-slate">
                Join the waitlist and selected users will receive early product testing access before the official launch.
              </p>
            </div>
            <WaitlistButton source="physical-version-banner" label="Join Waitlist Now" wide />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
