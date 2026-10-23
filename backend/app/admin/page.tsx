import { requireAdmin } from "@/lib/session";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default async function AdminPage() {
  const session = await requireAdmin();
  if (!session) redirect("/admin/login");

  return <AdminDashboard adminName={session?.name ?? "Admin"} />;
}
