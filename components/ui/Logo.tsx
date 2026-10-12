import Link from "next/link";
import { Inter } from "next/font/google";

// Preserve the existing wordmark lettering when the site's body font changes.
const brandFont = Inter({ subsets: ["latin"], display: "swap" });

/** The fixed Voxlate mark. Only its displayed size may change — never crop, recolour or filter it. */
export function Logo({ className = "h-24 w-auto" }: { className?: string }) {
  return <img src="/images/logo.webp" alt="Voxlate" width={488} height={568} className={className} />;
}

/** Mark + existing VOXLATE wordmark and tagline, scaled together. */
export function LogoLockup({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex shrink-0 items-center gap-2 rounded-md max-[360px]:gap-1.5" aria-label="Voxlate home">
      <Logo className="h-11 w-auto max-[360px]:h-9 md:h-12" />
      <span className={`${brandFont.className} leading-none`} aria-hidden="true">
        <span className="block text-[22px] font-bold tracking-tight text-ink max-[360px]:text-[20px] md:text-2xl">VOXLATE</span>
        <span className="mt-0.5 block whitespace-nowrap text-[9px] font-medium uppercase tracking-widest text-slate max-[360px]:text-[7.5px] md:text-[10px]">
          Breaking Language Barriers
        </span>
      </span>
    </Link>
  );
}
