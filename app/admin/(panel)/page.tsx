import Link from "next/link";
import { Car, ChevronRight, FolderTree, Inbox, Mail, Wrench } from "lucide-react";
import { PushPrompt } from "@/components/admin/app-install";
import { deadline } from "@/lib/inquiry-deadline";
import { CAMPAIGN_STATUS } from "@/lib/campaign-labels";
import { Badge, Card, PageTitle } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { INQUIRY_STATUS, INQUIRY_TYPES } from "@/lib/inquiry-labels";

export const metadata = { title: "Tableau de bord" };

export default async function Dashboard() {
  const [vehicles, hidden, cats, fresh, savOpen, latest, todo, running] = await Promise.all([
    db.vehicle.count({ where: { published: true } }),
    db.vehicle.count({ where: { published: false } }),
    db.category.count(),
    db.inquiry.count({ where: { status: "nouveau" } }),
    db.inquiry.count({ where: { type: "sav", status: { in: ["nouveau", "en_cours"] } } }),
    db.inquiry.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    db.inquiry.findMany({ where: { status: { in: ["nouveau", "en_cours"] } }, orderBy: { createdAt: "asc" }, take: 10 }),
    db.campaign.findMany({ where: { status: { in: ["envoi", "programmee", "pause"] } }, orderBy: { updatedAt: "desc" }, take: 5 }),
  ]);
  const progress = running.length
    ? await db.campaignRecipient.groupBy({ by: ["campaignId", "status"], where: { campaignId: { in: running.map((c) => c.id) } }, _count: true })
    : [];
  const tiles = [
    { label: "Nouvelles demandes", value: fresh, icon: Inbox, href: "/admin/demandes?status=nouveau" },
    { label: "SAV en cours", value: savOpen, icon: Wrench, href: "/admin/demandes?type=sav" },
    { label: "Véhicules en ligne", value: vehicles, sub: hidden ? `${hidden} masqué(s)` : undefined, icon: Car, href: "/admin/vehicules" },
    { label: "Gammes", value: cats, icon: FolderTree, href: "/admin/gammes" },
  ];
  return (
    <>
      <PageTitle title="Tableau de bord" />
      <PushPrompt />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className="rounded-2xl border border-ink/10 bg-white p-4 transition hover:border-brand-500 sm:p-5">
            <t.icon className="h-5 w-5 text-brand-500" aria-hidden />
            <p className="mt-3 font-display text-3xl font-extrabold">{t.value}</p>
            <p className="text-sm text-ink/60">{t.label}</p>
            {t.sub && <p className="text-xs text-ink/40">{t.sub}</p>}
          </Link>
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card title={`À traiter (${todo.length}${todo.length === 10 ? "+" : ""})`}>
          {todo.length ? (
            <ul className="-mx-2 divide-y divide-ink/5">
              {todo.map((q) => {
                const due = deadline(q.createdAt);
                return (
                  <li key={q.id}>
                    <Link href={`/admin/demandes/${q.id}`} className="flex items-center gap-3 rounded-xl px-2 py-3 text-sm hover:bg-sand active:bg-sand">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${q.status === "nouveau" ? "bg-amber-400" : "bg-sky-400"}`} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">{q.firstName} {q.lastName}</span>
                        <span className="block truncate text-xs text-ink/50">{INQUIRY_TYPES[q.type]?.label} · {q.vehicleRef ?? q.subject ?? q.company ?? q.email}</span>
                      </span>
                      <Badge tone={due.tone}>{due.label}</Badge>
                      <ChevronRight className="h-4 w-4 shrink-0 text-ink/30" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : <p className="text-sm text-ink/55">Tout est traité 🎉</p>}
        </Card>
        <Card title="Campagnes en cours">
          {running.length ? (
            <ul className="space-y-4">
              {running.map((c) => {
                const rows = progress.filter((p) => p.campaignId === c.id);
                const total = rows.reduce((a, r) => a + r._count, 0);
                const done = rows.filter((r) => r.status !== "attente").reduce((a, r) => a + r._count, 0);
                const pct = total ? Math.round((done / total) * 100) : 0;
                return (
                  <li key={c.id}>
                    <Link href={`/admin/campagnes/${c.id}`} className="block text-sm">
                      <span className="flex items-center gap-2"><span className="flex-1 truncate font-semibold">{c.name}</span><Badge tone={CAMPAIGN_STATUS[c.status]?.tone}>{CAMPAIGN_STATUS[c.status]?.label}</Badge></span>
                      <span className="mt-2 block h-2 overflow-hidden rounded-full bg-ink/5"><span className="block h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} /></span>
                      <span className="mt-1 block text-xs text-ink/50">{done} / {total} envoyés · {pct} %{c.scheduledAt && c.status === "programmee" ? ` · prévue le ${c.scheduledAt.toLocaleString("fr-FR")}` : ""}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-ink/55">Aucune campagne en cours. <Link href="/admin/campagnes" className="inline-flex items-center gap-1 font-semibold text-brand-600"><Mail className="h-4 w-4" /> Lancer une campagne</Link></p>
          )}
        </Card>
      </div>
      <Card title="Dernières demandes" className="mt-6">
        {latest.length ? (
          <ul className="divide-y divide-ink/5">
            {latest.map((q) => (
              <li key={q.id}>
                <Link href={`/admin/demandes/${q.id}`} className="flex flex-wrap items-center gap-3 py-3 text-sm hover:text-brand-600">
                  <Badge tone={INQUIRY_TYPES[q.type]?.tone}>{INQUIRY_TYPES[q.type]?.label ?? q.type}</Badge>
                  <span className="font-semibold">{q.firstName} {q.lastName}</span>
                  <span className="text-ink/50">{q.vehicleRef ?? q.subject ?? ""}</span>
                  <span className="ml-auto flex items-center gap-3 text-xs text-ink/50">
                    <Badge tone={INQUIRY_STATUS[q.status]?.tone}>{INQUIRY_STATUS[q.status]?.label ?? q.status}</Badge>
                    {q.createdAt.toLocaleDateString("fr-FR")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink/55">Aucune demande pour le moment.</p>
        )}
      </Card>
    </>
  );
}
