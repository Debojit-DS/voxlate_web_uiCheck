import { DEVELOPMENT_MESSAGE } from "@/lib/productCopy";
import { Plus } from "lucide-react";

// Original questions; answers carry the claim qualifications recorded in REDESIGN_CONTENT_MAP.md (C8–C12).
const FAQS = [
  {
    question: "What is Voxlate?",
    answer:
      "Voxlate is an AI-powered real-time voice translation platform being built to preserve your natural voice, tone, and emotion across languages. It is designed to enable seamless communication whether you are in an online meeting or face-to-face conversation. Today you can try a recorded-clip web demo; the desktop app and wearable device are still in development.",
  },
  {
    question: "Is Voxlate free to use?",
    answer:
      "Voxlate plans to offer a free tier for basic translation needs, with paid plans for power users and businesses. Exact pricing will be announced closer to launch.",
  },
  {
    question: "How many languages does it support?",
    answer:
      "Our initial focus is Hindi ↔ English in both directions; Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia, Assamese and Urdu ↔ English are part of our development roadmap. Our long-term goal is to cover the majority of the world's most-spoken languages. The web demo currently offers its own list of target languages.",
  },
  {
    question: "Can businesses and organizations use Voxlate?",
    answer:
      "Yes. Voxlate is being built for both individual users and businesses. Teams will be able to use it for global meetings, and integrating it into enterprise communication workflows is part of the plan.",
  },
  {
    question: "When will Voxlate be available?",
    answer:
      `${DEVELOPMENT_MESSAGE} Join the waitlist for launch updates and early access.`,
  },
  {
    question: "How does the waitlist work?",
    answer:
      "Create an account, then join with your name and email. Joining also unlocks the web demo. We will email you the moment Voxlate launches, and selected users will get early product testing access before the public release.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="py-16 md:py-24">
      <div className="page-container grid gap-10 md:grid-cols-[1fr_1.6fr] md:gap-16">
        <h2 id="faq-title" className="display-section">
          Frequently Asked Questions
        </h2>
        <div className="border-t border-line">
          {FAQS.map((item) => (
            <details key={item.question} className="group border-b border-line">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[17px] font-medium text-ink [&::-webkit-details-marker]:hidden">
                {item.question}
                <Plus size={18} aria-hidden className="shrink-0 text-slate transition-transform duration-150 group-open:rotate-45" />
              </summary>
              <p className="max-w-[62ch] pb-6 text-[16px] leading-relaxed text-slate">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
