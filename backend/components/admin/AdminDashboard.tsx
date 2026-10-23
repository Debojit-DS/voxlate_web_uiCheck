"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

type Stats = {
  totalWaitlist: number;
  totalUsers: number;
  newLast7Days: number;
  totalApplications: number;
  byProduct: { product: string; count: number }[];
  byType: { type: string; count: number }[];
};

type WaitlistEntry = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  type: string;
  product: string;
  source: string | null;
  createdAt: string;
};

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
};

type JobApplication = {
  id: string;
  fullName: string;
  email: string;
  contactNumber: string;
  college: string;
  currentYear: string;
  roleAppliedFor: string;
  strongestSkills: string;
  motivation: string;
  projectDetails: string | null;
  proposedIdea: string;
  uniqueEdge: string;
  portfolioLinks: string | null;
  resumeUrl: string;
  status: string;
  createdAt: string;
};

type Tab = "overview" | "waitlist" | "users" | "applications";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "waitlist", label: "Waitlist" },
  { id: "users", label: "Users" },
  { id: "applications", label: "Applications" },
];

export function AdminDashboard({ adminName }: { adminName: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
            Voxlate Admin
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Signed in as {adminName}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-[var(--radius-button)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface-alt)]"
        >
          Sign out
        </button>
      </header>

      <nav className="mb-6 flex gap-1 rounded-[var(--radius-button)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-[calc(var(--radius-button)-2px)] px-4 py-1.5 text-sm font-medium transition ${
              tab === t.id
                ? "bg-[var(--color-orange)] text-white"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "overview" && <OverviewTab />}
      {tab === "waitlist" && <WaitlistTab />}
      {tab === "users" && <UsersTab />}
      {tab === "applications" && <ApplicationsTab />}
    </div>
  );
}

// ---------------- Overview ----------------

function OverviewTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((json) => setStats(json.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-[var(--color-text-secondary)]">Loading…</p>;
  if (!stats) return <p className="text-sm text-[var(--color-danger)]">Failed to load stats.</p>;

  const cards = [
    { label: "Total waitlist signups", value: stats.totalWaitlist },
    { label: "Registered users", value: stats.totalUsers },
    { label: "Job applications", value: stats.totalApplications },
    { label: "New signups (7 days)", value: stats.newLast7Days },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5"
          >
            <p className="text-sm text-[var(--color-text-secondary)]">{c.label}</p>
            <p className="mt-1 text-3xl font-semibold text-[var(--color-text-primary)]">
              {c.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <BreakdownCard title="By product" rows={stats.byProduct.map((p) => ({ label: p.product, count: p.count }))} />
        <BreakdownCard title="By signup type" rows={stats.byType.map((t) => ({ label: t.type, count: t.count }))} />
      </div>
    </div>
  );
}

function BreakdownCard({ title, rows }: { title: string; rows: { label: string; count: number }[] }) {
  const total = rows.reduce((sum, r) => sum + r.count, 0) || 1;
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
      <p className="mb-3 text-sm font-medium text-[var(--color-text-primary)]">{title}</p>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="capitalize text-[var(--color-text-secondary)]">{r.label}</span>
              <span className="text-[var(--color-text-primary)]">{r.count}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-bg-surface-alt)]">
              <div
                className="h-full rounded-full bg-[var(--color-orange)]"
                style={{ width: `${(r.count / total) * 100}%` }}
              />
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="text-sm text-[var(--color-text-muted)]">No data yet.</p>
        )}
      </div>
    </div>
  );
}

// ---------------- Waitlist ----------------

function WaitlistTab() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const abortControllerRef = useRef<AbortController | null>(null);

  const load = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "25" });
    if (search) params.set("search", search);
    fetch(`/api/admin/waitlist?${params}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((json) => {
        setEntries(json.data ?? []);
        setTotalPages(json.pagination?.totalPages ?? 1);
      })
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [load]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-param-change pattern; setLoading(true) inside load() causes one harmless extra render
    load();
  }, [load]);

  async function handleDelete(id: string) {
    if (!confirm("Remove this signup from the waitlist?")) return;
    await fetch(`/api/admin/waitlist?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] p-4">
        <input
          type="text"
          placeholder="Search name, email, company…"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="w-64 rounded-[var(--radius-input)] border border-[var(--color-border)] px-3 py-1.5 text-sm outline-none focus:border-[var(--color-orange)]"
        />
        <a
          href="/api/admin/waitlist/export"
          className="rounded-[var(--radius-button)] border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface-alt)]"
        >
          Export CSV
        </a>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-[var(--color-text-secondary)]">
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Company</th>
              <th className="px-4 py-2 font-medium">Type</th>
              <th className="px-4 py-2 font-medium">Product</th>
              <th className="px-4 py-2 font-medium">Joined</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-b border-[var(--color-border)] last:border-0">
                <td className="px-4 py-2 text-[var(--color-text-primary)]">{e.name}</td>
                <td className="px-4 py-2 text-[var(--color-text-secondary)]">{e.email}</td>
                <td className="px-4 py-2 text-[var(--color-text-secondary)]">{e.company || "—"}</td>
                <td className="px-4 py-2 capitalize text-[var(--color-text-secondary)]">{e.type}</td>
                <td className="px-4 py-2 capitalize text-[var(--color-text-secondary)]">{e.product}</td>
                <td className="px-4 py-2 text-[var(--color-text-secondary)]">
                  {new Date(e.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => handleDelete(e.id)}
                    className="text-sm text-[var(--color-danger)] hover:underline"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {!loading && entries.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[var(--color-text-muted)]">
                  No waitlist signups found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}

// ---------------- Users ----------------

function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const abortControllerRef = useRef<AbortController | null>(null);

  const load = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "25" });
    if (search) params.set("search", search);
    fetch(`/api/admin/users?${params}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((json) => {
        setUsers(json.data ?? []);
        setTotalPages(json.pagination?.totalPages ?? 1);
      })
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [load]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-param-change pattern; setLoading(true) inside load() causes one harmless extra render
    load();
  }, [load]);

  async function toggleRole(user: AdminUser) {
    const nextRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, role: nextRole }),
    });
    const json = await res.json();
    if (json.status !== "success") {
      alert(json.message || "Could not update role.");
      return;
    }
    load();
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
      <div className="border-b border-[var(--color-border)] p-4">
        <input
          type="text"
          placeholder="Search name, email…"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="w-64 rounded-[var(--radius-input)] border border-[var(--color-border)] px-3 py-1.5 text-sm outline-none focus:border-[var(--color-orange)]"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-[var(--color-text-secondary)]">
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Role</th>
              <th className="px-4 py-2 font-medium">Joined</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-[var(--color-border)] last:border-0">
                <td className="px-4 py-2 text-[var(--color-text-primary)]">{u.name}</td>
                <td className="px-4 py-2 text-[var(--color-text-secondary)]">{u.email}</td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded-[var(--radius-pill)] px-2 py-0.5 text-xs font-medium ${
                      u.role === "ADMIN"
                        ? "bg-[var(--color-gold-light)] text-[var(--color-gold)]"
                        : "bg-[var(--color-bg-surface-alt)] text-[var(--color-text-secondary)]"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-2 text-[var(--color-text-secondary)]">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => toggleRole(u)}
                    className="text-sm text-[var(--color-accent-blue)] hover:underline"
                  >
                    {u.role === "ADMIN" ? "Revoke admin" : "Make admin"}
                  </button>
                </td>
              </tr>
            ))}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[var(--color-text-muted)]">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}

// ---------------- Applications ----------------

function ApplicationsTab() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const abortControllerRef = useRef<AbortController | null>(null);

  const load = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "25" });
    if (search) params.set("search", search);
    fetch(`/api/admin/applications?${params}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((json) => {
        setApplications(json.data ?? []);
        setTotalPages(json.pagination?.totalPages ?? 1);
      })
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [load]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-param-change pattern; setLoading(true) inside load() causes one harmless extra render
    load();
  }, [load]);

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] p-4">
        <input
          type="text"
          placeholder="Search name, email, college…"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="w-64 rounded-[var(--radius-input)] border border-[var(--color-border)] px-3 py-1.5 text-sm outline-none focus:border-[var(--color-orange)]"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-[var(--color-text-secondary)]">
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Contact</th>
              <th className="px-4 py-2 font-medium">College</th>
              <th className="px-4 py-2 font-medium">Year</th>
              <th className="px-4 py-2 font-medium">Role</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Applied</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id} className="border-b border-[var(--color-border)] last:border-0">
                <td className="px-4 py-2 text-[var(--color-text-primary)]">{app.fullName}</td>
                <td className="px-4 py-2 text-[var(--color-text-secondary)]">{app.email}</td>
                <td className="px-4 py-2 text-[var(--color-text-secondary)]">{app.contactNumber}</td>
                <td className="px-4 py-2 text-[var(--color-text-secondary)]">{app.college}</td>
                <td className="px-4 py-2 text-[var(--color-text-secondary)]">{app.currentYear}</td>
                <td className="px-4 py-2 text-[var(--color-text-secondary)]">{app.roleAppliedFor}</td>
                <td className="px-4 py-2">
                  <span className="rounded-[var(--radius-pill)] bg-[var(--color-bg-surface-alt)] px-2 py-0.5 text-xs font-medium text-[var(--color-text-secondary)]">
                    {app.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-[var(--color-text-secondary)]">
                  {new Date(app.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 text-right">
                  <a
                    href={app.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--color-accent-blue)] hover:underline"
                  >
                    Resume
                  </a>
                </td>
              </tr>
            ))}
            {!loading && applications.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-[var(--color-text-muted)]">
                  No applications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}

// ---------------- Shared ----------------

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-[var(--color-border)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
      <span>
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="rounded-[var(--radius-button)] border border-[var(--color-border)] px-3 py-1 disabled:opacity-40"
        >
          Previous
        </button>
        <button
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="rounded-[var(--radius-button)] border border-[var(--color-border)] px-3 py-1 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
