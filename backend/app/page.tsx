import Link from "next/link";

export default function BackendHomePage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg-page)] flex flex-col items-center justify-center p-6 text-[var(--color-text-primary)]">
      <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] p-8 max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Voxlate Backend & API</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Core REST services, authentication proxy, and administrative controls.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/admin"
            className="w-full py-2.5 px-4 rounded-lg bg-[var(--color-navy-cta)] text-white font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Open Admin Dashboard
          </Link>
          <Link
            href="/api/health"
            className="w-full py-2.5 px-4 rounded-lg border border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-bg-surface-alt)] transition-colors"
          >
            Check API Health Status
          </Link>
        </div>

        <div className="text-xs text-[var(--color-text-muted)] border-t border-[var(--color-border)] pt-4">
          Running on port 3001 · Connected to MongoDB
        </div>
      </div>
    </main>
  );
}

