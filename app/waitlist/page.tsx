"use client";

import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { useWaitlistModal } from "@/components/waitlist/WaitlistModalProvider";
import { getPublicWaitlist, type PublicWaitlistEntry } from "@/lib/waitlistApi";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const PAGE_SIZE = 20;

export default function WaitlistPage() {
  const { openModal } = useWaitlistModal();
  const [entries, setEntries] = useState<PublicWaitlistEntry[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const goToPage = (next: number) => {
    setLoading(true);
    setPage(next);
  };

  useEffect(() => {
    let cancelled = false;
    getPublicWaitlist(page, PAGE_SIZE).then((res) => {
      if (cancelled) return;
      setEntries(res.data ?? []);
      setTotalPages(res.pagination?.totalPages ?? 1);
      setTotal(res.failed ? null : res.pagination?.total ?? 0);
      setFailed(!!res.failed);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [page]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="page-container pb-20 pt-12 md:pb-28 md:pt-16">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Our Community</p>
            <h1 className="display-page mt-4">View Our Waitlisters</h1>
            <p className="lead mt-4">
              Join a growing community of individuals and organizations ready to experience Voxlate. Here&apos;s who&apos;s
              already on the list.
            </p>
          </div>
          {total !== null && (
            <p className="shrink-0 border-l-2 border-primary pl-4">
              <span className="block font-display text-[40px] leading-none text-ink">{total.toLocaleString()}</span>
              <span className="mt-1 block text-[14px] text-slate">Total Waitlisters</span>
            </p>
          )}
        </div>

        <section aria-label="Waitlist members" className="mt-12 border-t border-line" aria-busy={loading}>
          {loading ? (
            <p className="py-12 text-[15px] text-slate" role="status">Loading the directory…</p>
          ) : failed ? (
            <p className="py-12 text-[15px] text-slate" role="alert">
              The directory couldn&apos;t be loaded right now. Please try again later.
            </p>
          ) : entries.length === 0 ? (
            <p className="py-12 text-[15px] text-slate">No one is listed yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {entries.map((entry) => (
                <li key={entry.id} className="flex items-center gap-4 py-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-mist">
                    {entry.photoUrl ? (
                      <img src={entry.photoUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <User className="text-slate" size={18} aria-hidden />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[16px] font-medium text-ink">{entry.name}</p>
                    {(entry.role || entry.organization) && (
                      <p className="truncate text-[14px] text-slate">
                        {[entry.role, entry.organization].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                  <p className="shrink-0 text-right text-[14px] text-slate">
                    <span className="sr-only">Joined </span>
                    <time dateTime={entry.createdAt}>{formatDate(entry.createdAt)}</time>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {!failed && totalPages > 1 && (
          <nav aria-label="Directory pages" className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
            <Button variant="secondary" size="sm" onClick={() => goToPage(Math.max(1, page - 1))} disabled={page === 1 || loading}>
              Previous
            </Button>
            <span className="text-[14px] text-slate" aria-live="polite">
              Page {page} of {totalPages}
            </span>
            <Button variant="secondary" size="sm" onClick={() => goToPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages || loading}>
              Next
            </Button>
          </nav>
        )}

        <section aria-labelledby="next-title" className="mt-16 flex flex-col items-start gap-6 rounded-[18px] border border-line bg-surface p-6 sm:p-10 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 id="next-title" className="display-section">Be the next one!</h2>
            <p className="mt-2 text-[17px] text-slate">Join the waitlist and get early access to Voxlate.</p>
            <p className="mt-4 text-[13px] text-slate">We respect your privacy. Your information is safe with us.</p>
          </div>
          <Button onClick={() => openModal("waitlist-page")} wide>
            Join Waitlist
          </Button>
        </section>
      </main>
      <Footer />
    </div>
  );
}
