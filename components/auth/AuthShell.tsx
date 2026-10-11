import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LogoLockup } from "@/components/ui/Logo";
import { Footer } from "@/components/layout/Footer";

/** Quiet frame for login/signup: identity, a way back, and the form. */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="page-container flex items-center justify-between gap-4 py-5">
        <LogoLockup />
        <Link href="/" className="inline-flex items-center gap-1.5 text-[14px] font-medium text-slate hover:text-ink">
          <ArrowLeft size={16} aria-hidden />
          Back to Home
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-5 pb-20 pt-6 md:pt-12">
        <div className="w-full max-w-[440px] rounded-[18px] border border-line bg-surface p-6 sm:p-9">
          <h1 className="font-display text-[34px] leading-tight text-ink">{title}</h1>
          <p className="mt-2 text-[15px] text-slate">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function AuthStatus({ title, message }: { title: string; message: string }) {
  return (
    <AuthShell title={title} subtitle={message}>
      <p role="status" className="sr-only">{`${title}. ${message}`}</p>
    </AuthShell>
  );
}
