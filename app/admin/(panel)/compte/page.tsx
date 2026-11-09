import { requireAdmin } from "@/lib/auth";
import { Card, PageTitle } from "@/components/admin/ui";
import { InstallApp, PushToggle } from "@/components/admin/app-install";
import { db } from "@/lib/db";
import { PasswordForm } from "./password-form";

export const metadata = { title: "Mon compte" };

export default async function AccountPage() {
  const user = await requireAdmin();
  const devices = await db.pushSubscription.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  return (
    <>
      <PageTitle title="Mon compte" subtitle={user.email} />
      <div id="application" className="grid scroll-mt-20 gap-6 lg:grid-cols-2">
        <Card title="Application mobile">
          <p className="mb-4 text-sm text-ink/60">Le back-office s'installe comme une application sur votre téléphone : icône sur l'écran d'accueil, plein écran, accès direct aux demandes et aux campagnes.</p>
          <InstallApp />
        </Card>
        <Card title="Notifications">
          <p className="mb-4 text-sm text-ink/60">Recevez une alerte sur cet appareil à chaque nouvelle demande, même application fermée. À activer sur chaque téléphone / ordinateur.</p>
          <PushToggle />
          {devices.length > 0 && (
            <div className="mt-5 border-t border-ink/10 pt-4">
              <p className="label">Appareils abonnés ({devices.length})</p>
              <ul className="space-y-1 text-sm text-ink/70">
                {devices.map((d) => (
                  <li key={d.id} className="flex justify-between gap-3"><span>{d.device ?? "Appareil"} · {d.topics.join(", ")}</span><span className="text-xs text-ink/45">{(d.lastUsed ?? d.createdAt).toLocaleDateString("fr-FR")}</span></li>
                ))}
              </ul>
            </div>
          )}
        </Card>
        <Card title="Changer de mot de passe"><PasswordForm /></Card>
      </div>
    </>
  );
}
