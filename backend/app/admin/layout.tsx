import type { ReactNode } from "react";

export const metadata = {
  title: "Admin — Voxlate",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-[var(--color-bg-page)]">{children}</div>;
}
