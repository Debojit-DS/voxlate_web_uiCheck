import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

type Props = {
  title: string;
  updated: string;
  toc?: { id: string; label: string }[];
  children: React.ReactNode;
};

/** Narrow, readable document layout shared by the legal pages. */
export function LegalDocument({ title, updated, toc, children }: Props) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="page-container pb-20 pt-14 md:pb-28 md:pt-20">
        <div className="grid gap-12 lg:grid-cols-[220px_minmax(0,680px)] lg:justify-center lg:gap-16">
          <header className="lg:col-start-2">
            <h1 className="display-page">{title}</h1>
            <p className="mt-4 text-[14px] text-slate">{updated}</p>
          </header>

          {toc && (
            <nav aria-label="Contents" className="lg:sticky lg:top-28 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:self-start">
              {/* Collapsed on small screens so the document starts right away. */}
              <details className="rounded-[6px] border border-line bg-surface p-4 lg:hidden">
                <summary className="cursor-pointer text-[14px] font-semibold text-ink">Contents</summary>
                <TocList toc={toc} />
              </details>
              <div className="hidden lg:block">
                <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-slate">Contents</p>
                <TocList toc={toc} />
              </div>
            </nav>
          )}

          <article className="legal lg:col-start-2">{children}</article>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function TocList({ toc }: { toc: { id: string; label: string }[] }) {
  return (
    <ol className="mt-3 max-h-[70vh] space-y-1.5 overflow-y-auto text-[14px]">
      {toc.map((item) => (
        <li key={item.id}>
          <a href={`#${item.id}`} className="text-ink hover:text-primary hover:underline">
            {item.label}
          </a>
        </li>
      ))}
    </ol>
  );
}

/** A section heading that can be linked to directly. */
export function LegalHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="group">
      <a href={`#${id}`} className="no-underline">
        {children}
        <span aria-hidden="true" className="ml-2 text-line-strong opacity-0 transition-opacity group-hover:opacity-100">
          #
        </span>
      </a>
    </h2>
  );
}
