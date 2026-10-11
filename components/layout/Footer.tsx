import Image from "next/image";
import { LogoLockup } from "@/components/ui/Logo";
import { UnderlineLink } from "@/components/ui/UnderlineLink";
import { WaitlistButton } from "@/components/waitlist/WaitlistButton";

// Original footer groups; placeholder `#` links given real destinations or removed (REDESIGN_CONTENT_MAP.md).
const GROUPS = [
  {
    title: "Company",
    links: [
      { label: "About Our Team", href: "/about" },
      { label: "Our Mission", href: "/about#mission" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Product",
    links: [
      { label: "Digital Version", href: "/digital-version" },
      { label: "Physical Version", href: "/physical-version" },
      { label: "Features", href: "/digital-version#features" },
      { label: "View Our Demo", href: "/demo" },
      { label: "Waitlist", href: "/waitlist" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Careers", href: "/careers" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

const SOCIAL = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/the-sn-tech-corporation/posts" },
  { label: "Instagram", href: "https://www.instagram.com/voxlate.sn" },
  { label: "X", href: "https://x.com/SNTechVoxlate" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="page-container py-12 md:py-16">
        <div className="grid gap-10 sm:grid-cols-3 lg:grid-cols-[1.3fr_repeat(3,0.8fr)_1.2fr]">
          <div className="sm:col-span-3 lg:col-span-1">
            <LogoLockup />
            <p className="mt-4 max-w-[34ch] text-[14px] leading-relaxed text-slate">
              Real-time AI translation designed to preserve your voice, tone and emotion.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <Image src="/images/Comapany-logo.png" alt="SN Tech Corporation" width={37} height={48} className="h-12 w-auto" />
              <p className="text-[14px] font-medium text-ink">Product of SN Tech Corporation</p>
            </div>
          </div>

          {GROUPS.map((group) => (
            <div key={group.title}>
              <h2 className="text-[13px] font-medium text-slate">{group.title}</h2>
              <ul className="mt-3 space-y-2.5 text-[15px]">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <UnderlineLink href={link.href} variant="center">
                      {link.label}
                    </UnderlineLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="sm:col-span-3 lg:col-span-1">
            <h2 className="text-[13px] font-medium text-slate">Stay Updated</h2>
            <p className="mt-3 max-w-[34ch] text-[14px] leading-relaxed text-slate">
              Join our waitlist and get the latest updates on our progress.
            </p>
            <div className="mt-4">
              <WaitlistButton source="footer" label="Join Waitlist" />
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-3 border-t border-line pt-6 sm:grid-cols-[auto_1fr] sm:items-baseline sm:gap-10">
          <h2 className="text-[13px] font-medium text-slate">Connect</h2>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
            {SOCIAL.map((s) => (
              <li key={s.href}>
                <UnderlineLink href={s.href} variant="comes-in-goes-out" direction="left" external>
                  {s.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </UnderlineLink>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-8 text-[13px] text-slate">© 2026 SN Tech Corporation. All rights reserved.</p>
      </div>
    </footer>
  );
}
