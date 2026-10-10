import { AdminShell } from "@/components/admin/shell";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { logout } from "../actions/auth";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const newInquiries = await db.inquiry.count({ where: { status: "nouveau" } });
  return <AdminShell user={user.email} newInquiries={newInquiries} logout={logout}>{children}</AdminShell>;
}
