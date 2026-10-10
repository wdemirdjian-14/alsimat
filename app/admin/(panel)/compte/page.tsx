import { requireAdmin } from "@/lib/auth";
import { Card, PageTitle } from "@/components/admin/ui";
import { PasswordForm } from "./password-form";

export const metadata = { title: "Mon compte" };

export default async function AccountPage() {
  const user = await requireAdmin();
  return (
    <>
      <PageTitle title="Mon compte" subtitle={user.email} />
      <Card title="Changer de mot de passe" className="max-w-lg"><PasswordForm /></Card>
    </>
  );
}
