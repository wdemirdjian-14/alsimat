import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Download, KanbanSquare, List, Upload } from "lucide-react";
import { SelectAll, StatusSelect } from "@/components/admin/crm-client";
import { Badge, Empty, NewButton, Notice, PageTitle } from "@/components/admin/ui";
import { SEGMENTS, STATUS, STATUSES } from "@/lib/crm";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { bulkAction } from "../../actions/crm";

export const metadata = { title: "Contacts" };

type SP = { q?: string; status?: string; segment?: string; tag?: string; list?: string; view?: string; ok?: string; page?: string };

export default async function ContactsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const where: Prisma.ContactWhereInput = {
    ...(sp.q ? { OR: ["email", "firstName", "lastName", "company", "city", "phone"].map((f) => ({ [f]: { contains: sp.q, mode: "insensitive" } })) } : {}),
    ...(sp.status ? { status: sp.status } : {}),
    ...(sp.segment ? { segment: sp.segment } : {}),
    ...(sp.tag ? { tags: { has: sp.tag } } : {}),
    ...(sp.list ? { lists: { some: { listId: sp.list } } } : {}),
  };
  const pipeline = sp.view === "pipeline";
  const [contacts, total, byStatus, tagRows, lists] = await Promise.all([
    db.contact.findMany({ where, orderBy: [{ lastContactAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }], take: pipeline ? 500 : 100, skip: pipeline ? 0 : (page - 1) * 100 }),
    db.contact.count({ where }),
    db.contact.groupBy({ by: ["status"], _count: true, _sum: { estimatedValue: true } }),
    db.$queryRaw<{ tag: string; n: bigint }[]>`SELECT unnest(tags) AS tag, count(*) AS n FROM "Contact" GROUP BY 1 ORDER BY 2 DESC LIMIT 30`,
    db.contactList.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { members: true } } } }),
  ]);
  const qs = (patch: Partial<SP>) => {
    const p = new URLSearchParams(Object.entries({ ...sp, ok: undefined, page: undefined, ...patch }).filter(([, v]) => v) as [string, string][]);
    return `/admin/contacts${p.size ? `?${p}` : ""}`;
  };
  const back = qs({});

  return (
    <>
      <PageTitle title="Contacts" subtitle={`${total} contact(s)`} action={
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/contacts/import" className="btn-ghost !py-2.5 text-ink"><Upload className="h-4 w-4" /> Importer</Link>
          <a href={`/admin/contacts/export?${new URLSearchParams(Object.entries(sp).filter(([k, v]) => v && k !== "view" && k !== "ok") as [string, string][])}`} className="btn-ghost !py-2.5 text-ink"><Download className="h-4 w-4" /> Exporter</a>
          <NewButton href="/admin/contacts/nouveau" label="Nouveau contact" />
        </div>
      } />
      <Notice ok={sp.ok} />

      {/* Pipeline résumé */}
      <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {STATUSES.map((s) => {
          const row = byStatus.find((b) => b.status === s.key);
          return (
            <Link key={s.key} href={qs({ status: sp.status === s.key ? undefined : s.key })} className={cn("rounded-2xl border bg-white p-3 transition hover:border-brand-500", sp.status === s.key ? "border-brand-500" : "border-ink/10")}>
              <p className="text-xs text-ink/55">{s.label}</p>
              <p className="font-display text-2xl font-extrabold">{row?._count ?? 0}</p>
              {!!row?._sum.estimatedValue && <p className="text-xs text-ink/50">{new Intl.NumberFormat("fr-FR").format(row._sum.estimatedValue)} € HT</p>}
            </Link>
          );
        })}
      </div>

      <form className="mb-4 flex flex-wrap gap-2">
        <input name="q" defaultValue={sp.q} placeholder="Nom, e-mail, société, ville…" className="field max-w-xs !py-2.5" />
        <select name="segment" defaultValue={sp.segment ?? ""} className="field max-w-[10rem] !py-2.5"><option value="">Tous segments</option>{SEGMENTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}</select>
        <select name="list" defaultValue={sp.list ?? ""} className="field max-w-[14rem] !py-2.5"><option value="">Toutes les listes</option>{lists.map((l) => <option key={l.id} value={l.id}>{l.name} ({l._count.members})</option>)}</select>
        <select name="tag" defaultValue={sp.tag ?? ""} className="field max-w-[12rem] !py-2.5"><option value="">Toutes étiquettes</option>{tagRows.map((t) => <option key={t.tag} value={t.tag}>{t.tag} ({Number(t.n)})</option>)}</select>
        {sp.status && <input type="hidden" name="status" value={sp.status} />}
        {pipeline && <input type="hidden" name="view" value="pipeline" />}
        <button className="btn-dark !py-2.5">Filtrer</button>
        <span className="ml-auto flex rounded-full bg-white p-1 ring-1 ring-ink/10">
          <Link href={qs({ view: undefined })} className={cn("flex items-center gap-1 rounded-full px-3 py-1.5 text-sm", !pipeline && "bg-ink text-white")}><List className="h-4 w-4" /> Liste</Link>
          <Link href={qs({ view: "pipeline" })} className={cn("flex items-center gap-1 rounded-full px-3 py-1.5 text-sm", pipeline && "bg-ink text-white")}><KanbanSquare className="h-4 w-4" /> Pipeline</Link>
        </span>
      </form>

      {!contacts.length ? (
        <Empty>Aucun contact. Les demandes du site créent automatiquement des contacts ; vous pouvez aussi importer un fichier.</Empty>
      ) : pipeline ? (
        <div className="grid gap-3 overflow-x-auto pb-4 lg:grid-cols-6">
          {STATUSES.map((s) => (
            <div key={s.key} className="min-w-56 rounded-2xl bg-white/60 p-2 ring-1 ring-ink/5">
              <p className="px-2 py-1 text-sm font-bold">{s.label} <span className="text-ink/40">{contacts.filter((c) => c.status === s.key).length}</span></p>
              <div className="space-y-2">
                {contacts.filter((c) => c.status === s.key).map((c) => (
                  <div key={c.id} className="rounded-xl bg-white p-3 text-sm shadow-sm ring-1 ring-ink/5">
                    <Link href={`/admin/contacts/${c.id}`} className="font-semibold hover:text-brand-600">{[c.firstName, c.lastName].filter(Boolean).join(" ") || c.email}</Link>
                    {c.company && <p className="text-xs text-ink/55">{c.company}</p>}
                    {c.estimatedValue && <p className="text-xs font-semibold text-brand-700">{new Intl.NumberFormat("fr-FR").format(c.estimatedValue)} € HT</p>}
                    <div className="mt-2"><StatusSelect id={c.id} value={c.status} /></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <form action={bulkAction}>
          <input type="hidden" name="back" value={back} />
          <div className="mb-3 flex flex-wrap items-center gap-2 rounded-2xl bg-white p-3 ring-1 ring-ink/10">
            <span className="text-sm text-ink/60">Sélection :</span>
            <select name="action" className="field max-w-[13rem] !py-2" defaultValue="">
              <option value="" disabled>Action…</option>
              <option value="list">Ajouter à la liste (nom)</option>
              <option value="unlist">Retirer de la liste (nom)</option>
              <option value="tag">Ajouter l'étiquette</option>
              <option value="untag">Retirer l'étiquette</option>
              <option value="status">Changer le statut (clé)</option>
              <option value="segment">Changer le segment (clé)</option>
              <option value="delete">Supprimer</option>
            </select>
            <input name="value" placeholder="liste / étiquette / statut (ex. a_contacter) / segment" className="field max-w-xs !py-2" />
            <button className="btn-dark !py-2">Appliquer</button>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-sand text-left text-xs text-ink/55 uppercase">
                <tr><th className="p-3"><SelectAll /></th><th className="p-3">Contact</th><th className="p-3">Société</th><th className="p-3">Statut</th><th className="p-3">Étiquettes</th><th className="p-3">Dernier contact</th></tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {contacts.map((c) => (
                  <tr key={c.id} className="hover:bg-sand/50">
                    <td className="p-3"><input type="checkbox" name="ids" value={c.id} className="h-4 w-4 accent-brand-500" /></td>
                    <td className="p-3">
                      <Link href={`/admin/contacts/${c.id}`} className="font-semibold hover:text-brand-600">{[c.firstName, c.lastName].filter(Boolean).join(" ") || "—"}</Link>
                      <span className="block text-xs text-ink/50">{c.email}{c.unsubscribed && " · désinscrit"}{c.bounced && " · adresse invalide"}</span>
                    </td>
                    <td className="p-3 text-ink/70">{c.company ?? "—"}{c.city && <span className="block text-xs text-ink/45">{c.city}</span>}</td>
                    <td className="p-3"><Badge tone={STATUS[c.status]?.tone}>{STATUS[c.status]?.label ?? c.status}</Badge></td>
                    <td className="p-3"><div className="flex flex-wrap gap-1">{c.tags.slice(0, 4).map((t) => <Link key={t} href={qs({ tag: t })} className="rounded-full bg-ink/5 px-2 py-0.5 text-xs">{t}</Link>)}</div></td>
                    <td className="p-3 text-xs whitespace-nowrap text-ink/55">{c.lastContactAt?.toLocaleDateString("fr-FR") ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {total > 100 && (
            <div className="mt-4 flex justify-center gap-2 text-sm">
              {page > 1 && <Link href={`${qs({})}${qs({}).includes("?") ? "&" : "?"}page=${page - 1}`} className="btn-ghost !py-2 text-ink">← Précédent</Link>}
              <span className="px-3 py-2">Page {page} / {Math.ceil(total / 100)}</span>
              {page * 100 < total && <Link href={`${qs({})}${qs({}).includes("?") ? "&" : "?"}page=${page + 1}`} className="btn-ghost !py-2 text-ink">Suivant →</Link>}
            </div>
          )}
        </form>
      )}
    </>
  );
}
