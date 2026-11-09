import { DeleteButton } from "@/components/admin/form-parts";
import { Badge, Card, PageTitle } from "@/components/admin/ui";
import { InviteForm, ResendButton } from "@/components/admin/users-client";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteAdmin } from "../../actions/users";

export const metadata = { title: "Administrateurs" };

export default async function UsersPage() {
  const me = await requireAdmin();
  const [users, devices] = await Promise.all([
    db.user.findMany({ orderBy: { createdAt: "asc" } }),
    db.pushSubscription.groupBy({ by: ["userId"], _count: true }),
  ]);
  return (
    <>
      <PageTitle title="Administrateurs" subtitle="Accès au back-office. Les notifications de demandes partent aussi vers les adresses définies dans Paramètres." />
      <div className="grid gap-6 lg:grid-cols-5">
        <Card title="Inviter un administrateur" className="lg:col-span-2">
          <p className="mb-4 text-sm text-ink/60">La personne reçoit un e-mail avec un lien (valable 7 jours) pour créer son mot de passe. Aucun mot de passe ne transite par e-mail.</p>
          <InviteForm />
        </Card>
        <Card title={`Comptes (${users.length})`} className="lg:col-span-3">
          <ul className="divide-y divide-ink/5">
            {users.map((u) => {
              const pending = !u.activated;
              const expired = pending && (!u.resetExpires || u.resetExpires < new Date());
              return (
                <li key={u.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{u.name ?? u.email}{u.id === me.id && <span className="font-normal text-ink/45"> (vous)</span>}</p>
                    <p className="truncate text-xs text-ink/50">{u.email} · {devices.find((d) => d.userId === u.id)?._count ?? 0} appareil(s) notifié(s)</p>
                  </div>
                  {pending ? <Badge tone={expired ? "red" : "amber"}>{expired ? "Invitation expirée" : "Invitation envoyée"}</Badge> : <Badge tone="green">Actif</Badge>}
                  <div className="flex w-full items-center gap-4 sm:w-auto">
                    <ResendButton id={u.id} label={pending ? "Renvoyer l'invitation" : "Envoyer un lien de mot de passe"} />
                    {u.id !== me.id && users.length > 1 && <DeleteButton action={deleteAdmin.bind(null, u.id)} label="Retirer" confirmText={`Retirer l'accès de ${u.email} ?`} />}
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </>
  );
}
