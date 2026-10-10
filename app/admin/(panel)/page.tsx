import Link from "next/link";
import { Car, FolderTree, Inbox, Wrench } from "lucide-react";
import { Badge, Card, PageTitle } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { INQUIRY_STATUS, INQUIRY_TYPES } from "@/lib/inquiry-labels";

export const metadata = { title: "Tableau de bord" };

export default async function Dashboard() {
  const [vehicles, hidden, cats, fresh, savOpen, latest] = await Promise.all([
    db.vehicle.count({ where: { published: true } }),
    db.vehicle.count({ where: { published: false } }),
    db.category.count(),
    db.inquiry.count({ where: { status: "nouveau" } }),
    db.inquiry.count({ where: { type: "sav", status: { in: ["nouveau", "en_cours"] } } }),
    db.inquiry.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ]);
  const tiles = [
    { label: "Nouvelles demandes", value: fresh, icon: Inbox, href: "/admin/demandes?status=nouveau" },
    { label: "SAV en cours", value: savOpen, icon: Wrench, href: "/admin/demandes?type=sav" },
    { label: "Véhicules en ligne", value: vehicles, sub: hidden ? `${hidden} masqué(s)` : undefined, icon: Car, href: "/admin/vehicules" },
    { label: "Gammes", value: cats, icon: FolderTree, href: "/admin/gammes" },
  ];
  return (
    <>
      <PageTitle title="Tableau de bord" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className="rounded-2xl border border-ink/10 bg-white p-5 transition hover:border-brand-500">
            <t.icon className="h-5 w-5 text-brand-500" aria-hidden />
            <p className="mt-3 font-display text-3xl font-extrabold">{t.value}</p>
            <p className="text-sm text-ink/60">{t.label}</p>
            {t.sub && <p className="text-xs text-ink/40">{t.sub}</p>}
          </Link>
        ))}
      </div>
      <Card title="Dernières demandes" className="mt-8">
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
