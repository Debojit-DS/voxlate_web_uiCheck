import { UnderlineLink } from "@/components/ui/UnderlineLink";
import { WaitlistButton } from "@/components/waitlist/WaitlistButton";

const PERKS = ["Early Access", "Free Product Testing (Selected Users)", "Priority Updates", "Founding Community Badge"];

/** Quiet closing call to action shared by Home and Digital. Wording from the original banner. */
export function EarlyTesterBanner({ source = "tester-banner" }: { source?: string }) {
  return (
    <section aria-labelledby={`tester-${source}`} className="border-t border-line bg-mist/60 py-16 md:py-24">
      <div className="page-container grid gap-10 md:grid-cols-[1.3fr_1fr] md:items-end md:gap-16">
        <div>
          <h2 id={`tester-${source}`} className="display-section">Become an Early Tester</h2>
          <p className="mt-4 max-w-[52ch] text-[17px] leading-relaxed text-slate">
            Join today and selected users will receive early product testing access before the official public release.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <WaitlistButton source={source} label="Join Waitlist Now" wide />
            <UnderlineLink href="/demo" variant="goes-out-comes-in" direction="right" className="text-[15px] font-semibold">
              View Our Demo
            </UnderlineLink>
          </div>
        </div>
        <ul className="divide-y divide-line border-y border-line text-[16px] text-ink">
          {PERKS.map((perk) => (
            <li key={perk} className="py-3">{perk}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
