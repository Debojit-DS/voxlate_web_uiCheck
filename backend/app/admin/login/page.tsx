"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// 1. Internal form component that uses client-side search params safely
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();

      if (json.status !== "success") {
        setError(json.message || "Something went wrong.");
        return;
      }

      // Login succeeded, but only admins may proceed past middleware.
      // Verify role via /api/auth/me before redirecting.
      const me = await fetch("/api/auth/me").then((r) => r.json());
      if (me?.data?.role !== "ADMIN") {
        setError("This account does not have admin access.");
        await fetch("/api/auth/logout", { method: "POST" });
        return;
      }

      router.push(from);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8 shadow-sm">
      <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
        Admin sign in
      </h1>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        Voxlate admin dashboard
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--color-text-primary)]">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-[var(--radius-input)] border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-orange)]"
            autoComplete="email"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--color-text-primary)]">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-[var(--radius-input)] border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-orange)]"
            autoComplete="current-password"
          />
        </div>

        {error && (
          <p className="text-sm text-[var(--color-danger)]" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-[var(--radius-button)] bg-[var(--color-orange)] py-2 text-sm font-medium text-white transition hover:bg-[var(--color-orange-hover)] disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

// 2. Default exported page layout wrapping the form in Suspense
export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-bg-page)] px-4">
      <Suspense fallback={
        <div className="text-sm text-[var(--color-text-secondary)] animate-pulse">
          Loading login portal...
        </div>
      }>
        <LoginForm />
      </Suspense>
    </main>
  );
}
