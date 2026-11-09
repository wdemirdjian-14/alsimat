import Link from "next/link";
import { Badge, Empty, NewButton, Notice, PageTitle } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { CAMPAIGN_STATUS } from "@/lib/campaign-labels";
import { marketingConfigured } from "@/lib/mail";

export const metadata = { title: "Campagnes e-mail" };


export default async function CampaignsPage({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const campaigns = await db.campaign.findMany({ orderBy: { createdAt: "desc" } });
  const stats = await db.campaignRecipient.groupBy({ by: ["campaignId"], _count: { _all: true, openedAt: true, clickedAt: true } });
  const sent = await db.campaignRecipient.groupBy({ by: ["campaignId"], where: { status: "envoye" }, _count: true });
  const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)} %` : "—");
  return (
    <>
      <PageTitle title="Campagnes e-mail" subtitle="Prospection et information de vos contacts." action={<NewButton href="/admin/campagnes/nouveau" label="Nouvelle campagne" />} />
      <Notice ok={(await searchParams).ok} />
      {!marketingConfigured() && (
        <p className="mb-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">Aucun serveur d'envoi n'est configuré : les campagnes peuvent être préparées mais pas envoyées. Voir <strong>Marketing & SEA → Envoi des e-mails</strong>.</p>
      )}
      {!campaigns.length ? <Empty>Aucune campagne. Créez-en une : objet, message, audience, puis envoi test avant lancement.</Empty> : (
        <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-sand text-left text-xs text-ink/55 uppercase"><tr><th className="p-3">Campagne</th><th className="p-3">Statut</th><th className="p-3">Envoyés</th><th className="p-3">Ouverture</th><th className="p-3">Clics</th></tr></thead>
            <tbody className="divide-y divide-ink/5">
              {campaigns.map((c) => {
                const s = stats.find((x) => x.campaignId === c.id)?._count;
                const n = sent.find((x) => x.campaignId === c.id)?._count ?? 0;
                return (
                  <tr key={c.id} className="hover:bg-sand/50">
                    <td className="p-3"><Link href={`/admin/campagnes/${c.id}`} className="font-semibold hover:text-brand-600">{c.name}</Link><span className="block text-xs text-ink/50">{c.subject}</span></td>
                    <td className="p-3"><Badge tone={CAMPAIGN_STATUS[c.status]?.tone}>{CAMPAIGN_STATUS[c.status]?.label}</Badge>{c.scheduledAt && c.status === "programmee" && <span className="block text-xs text-ink/50">{c.scheduledAt.toLocaleString("fr-FR")}</span>}</td>
                    <td className="p-3">{n}{s ? ` / ${s._all}` : ""}</td>
                    <td className="p-3">{pct(s?.openedAt ?? 0, n)}</td>
                    <td className="p-3">{pct(s?.clickedAt ?? 0, n)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
