import Link from "next/link";
import { Download, KanbanSquare, List, SlidersHorizontal, Upload, X } from "lucide-react";
import { SelectAll, StatusSelect } from "@/components/admin/crm-client";
import { Badge, Empty, NewButton, Notice, PageTitle } from "@/components/admin/ui";
import { categoryLabel, SIZES } from "@/lib/categories";
import { contactWhere, NO_CATEGORY, pickFilters, type ContactFilters } from "@/lib/contact-filters";
import { SEGMENTS, STATUS, STATUSES } from "@/lib/crm";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { bulkAction } from "../../actions/crm";

export const metadata = { title: "Contacts" };

type SP = ContactFilters & { view?: string; ok?: string; page?: string };
const nf = new Intl.NumberFormat("fr-FR");

export default async function ContactsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const filters = pickFilters(sp as Record<string, string | undefined>);
  const where = contactWhere(filters);
  const pipeline = sp.view === "pipeline";
  const cats = (sp.cat ?? "").split(",").filter(Boolean);
  const [contacts, total, byStatus, tagRows, lists, byCategory, byRegion, byDep, byStars, all] = await Promise.all([
    db.contact.findMany({ where, orderBy: [{ lastContactAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }], take: pipeline ? 500 : 100, skip: pipeline ? 0 : (page - 1) * 100 }),
    db.contact.count({ where }),
    db.contact.groupBy({ by: ["status"], where: contactWhere({ ...filters, status: undefined }), _count: true, _sum: { estimatedValue: true } }),
    db.$queryRaw<{ tag: string; n: bigint }[]>`SELECT unnest(tags) AS tag, count(*) AS n FROM "Contact" GROUP BY 1 ORDER BY 2 DESC LIMIT 40`,
    db.contactList.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { members: true } } } }),
    db.contact.groupBy({ by: ["category"], _count: true }),
    db.contact.groupBy({ by: ["region"], where: { region: { not: null }, ...(cats.length ? contactWhere({ cat: sp.cat }) : {}) }, _count: true, orderBy: { region: "asc" } }),
    db.contact.groupBy({ by: ["department"], where: { department: { not: null }, ...(sp.region ? { region: sp.region } : {}), ...(cats.length ? contactWhere({ cat: sp.cat }) : {}) }, _count: true, orderBy: { department: "asc" } }),
    db.contact.groupBy({ by: ["stars"], where: { stars: { not: null } }, _count: true, orderBy: { stars: "asc" } }),
    db.contact.count(),
  ]);
  const qs = (patch: Partial<SP>) => {
    const p = new URLSearchParams(Object.entries({ ...sp, ok: undefined, page: undefined, ...patch }).filter(([, v]) => v) as [string, string][]);
    return `/admin/contacts${p.size ? `?${p}` : ""}`;
  };
  const back = qs({});
  const toggleCat = (k: string) => qs({ cat: (cats.includes(k) ? cats.filter((c) => c !== k) : [...cats, k]).join(",") || undefined, dep: undefined });
  const categories = byCategory
    .map((c) => ({ key: c.category ?? NO_CATEGORY, label: c.category ? categoryLabel(c.category) : "Sans catégorie", n: c._count }))
    .sort((a, b) => Number(cats.includes(b.key)) - Number(cats.includes(a.key)) || (a.key === NO_CATEGORY ? 1 : b.key === NO_CATEGORY ? -1 : b.n - a.n));
  const listName = (id?: string) => lists.find((l) => l.id === id)?.name ?? id;
  const active: [keyof SP, string][] = [
    ...(sp.q ? [["q", `« ${sp.q} »`] as [keyof SP, string]] : []),
    ...(sp.region ? [["region", sp.region] as [keyof SP, string]] : []),
    ...(sp.dep ? [["dep", `Dép. ${sp.dep}`] as [keyof SP, string]] : []),
    ...(sp.stars ? [["stars", `${sp.stars} ★`] as [keyof SP, string]] : []),
    ...(sp.size ? [["size", SIZES.find((x) => x.key === sp.size)?.label ?? sp.size] as [keyof SP, string]] : []),
    ...(sp.list ? [["list", `Liste : ${listName(sp.list)}`] as [keyof SP, string]] : []),
    ...(sp.segment ? [["segment", SEGMENTS.find((x) => x.key === sp.segment)?.label ?? sp.segment] as [keyof SP, string]] : []),
    ...(sp.tag ? [["tag", `#${sp.tag}`] as [keyof SP, string]] : []),
    ...(sp.status ? [["status", STATUS[sp.status]?.label ?? sp.status] as [keyof SP, string]] : []),
    ...(sp.tel ? [["tel", "Avec téléphone"] as [keyof SP, string]] : []),
    ...(sp.reach ? [["reach", "Joignables par e-mail"] as [keyof SP, string]] : []),
  ];
  const advanced = active.filter(([k]) => k !== "q" && k !== "status").length;
  const exportQs = new URLSearchParams(Object.entries(filters).filter(([, v]) => v) as [string, string][]).toString();

  return (
    <>
      <PageTitle title="Contacts" subtitle={`${nf.format(total)} sur ${nf.format(all)} contact(s)`} action={
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/contacts/import" className="btn-ghost !py-2.5 text-ink"><Upload className="h-4 w-4" /> Importer</Link>
          <a href={`/admin/contacts/export${exportQs ? `?${exportQs}` : ""}`} className="btn-ghost !py-2.5 text-ink"><Download className="h-4 w-4" /> Exporter{total !== all ? ` (${nf.format(total)})` : ""}</a>
          <NewButton href="/admin/contacts/nouveau" label="Nouveau contact" />
        </div>
      } />
      <Notice ok={sp.ok} />

      {/* Catégories : un clic affiche / masque une catégorie (plusieurs possibles) */}
      {categories.length > 0 && (
        <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Catégories">
          <Link href={qs({ cat: undefined, dep: undefined })} className={cn("shrink-0 rounded-full px-4 py-2 text-sm font-semibold ring-1", !cats.length ? "bg-ink text-white ring-ink" : "bg-white text-ink/70 ring-ink/10 hover:ring-ink/30")}>
            Toutes <span className="opacity-60">{nf.format(all)}</span>
          </Link>
          {categories.map((c) => {
            const on = cats.includes(c.key);
            return (
              <Link key={c.key} href={toggleCat(c.key)} aria-pressed={on}
                className={cn("shrink-0 rounded-full px-4 py-2 text-sm font-semibold ring-1 transition", on ? "bg-brand-500 text-white ring-brand-500" : "bg-white text-ink/70 ring-ink/10 hover:ring-brand-500")}>
                {on && "✓ "}{c.label} <span className="opacity-60">{nf.format(c.n)}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pipeline résumé (selon les filtres en cours) */}
      <div className="-mx-4 mb-4 flex snap-x scroll-px-4 gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 lg:grid-cols-6">
        {STATUSES.map((s) => {
          const row = byStatus.find((b) => b.status === s.key);
          return (
            <Link key={s.key} href={qs({ status: sp.status === s.key ? undefined : s.key })} className={cn("min-w-32 shrink-0 snap-start rounded-2xl border bg-white p-3 transition hover:border-brand-500 sm:min-w-0", sp.status === s.key ? "border-brand-500" : "border-ink/10")}>
              <p className="text-xs text-ink/55">{s.label}</p>
              <p className="font-display text-2xl font-extrabold">{nf.format(row?._count ?? 0)}</p>
              {!!row?._sum.estimatedValue && <p className="text-xs text-ink/50">{nf.format(row._sum.estimatedValue)} € HT</p>}
            </Link>
          );
        })}
      </div>

      <form className="mb-4 rounded-2xl bg-white p-3 ring-1 ring-ink/10">
        {sp.cat && <input type="hidden" name="cat" value={sp.cat} />}
        {sp.status && <input type="hidden" name="status" value={sp.status} />}
        {pipeline && <input type="hidden" name="view" value="pipeline" />}
        <div className="flex flex-wrap gap-2">
          <input name="q" type="search" defaultValue={sp.q} placeholder="Nom, e-mail, société, ville, code postal…" className="field min-w-0 basis-full !py-2.5 sm:basis-auto sm:flex-1 sm:min-w-64" />
          <button className="btn-dark !py-2.5">Filtrer</button>
          <span className="flex rounded-full bg-sand p-1">
            <Link href={qs({ view: undefined })} className={cn("flex items-center gap-1 rounded-full px-3 py-1.5 text-sm", !pipeline && "bg-ink text-white")}><List className="h-4 w-4" /> Liste</Link>
            <Link href={qs({ view: "pipeline" })} className={cn("flex items-center gap-1 rounded-full px-3 py-1.5 text-sm", pipeline && "bg-ink text-white")}><KanbanSquare className="h-4 w-4" /> Pipeline</Link>
          </span>
        </div>
        <details className="group mt-2" open={advanced > 0}>
          <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full px-2 py-1 text-sm font-semibold text-brand-700">
            <SlidersHorizontal className="h-4 w-4" /> Affiner{advanced ? ` (${advanced})` : ""}
          </summary>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block"><span className="label">Région</span>
              <select name="region" defaultValue={sp.region ?? ""} className="field !py-2"><option value="">Toutes</option>{byRegion.map((r) => <option key={r.region} value={r.region!}>{r.region} ({nf.format(r._count)})</option>)}</select>
            </label>
            <label className="block"><span className="label">Département</span>
              <select name="dep" defaultValue={sp.dep ?? ""} className="field !py-2"><option value="">Tous</option>{byDep.map((d) => <option key={d.department} value={d.department!}>{d.department} ({nf.format(d._count)})</option>)}</select>
            </label>
            {byStars.length > 0 && (
              <label className="block"><span className="label">Classement</span>
                <select name="stars" defaultValue={sp.stars ?? ""} className="field !py-2"><option value="">Tous</option>{byStars.map((x) => <option key={x.stars} value={String(x.stars)}>{"★".repeat(x.stars!)} ({nf.format(x._count)})</option>)}</select>
              </label>
            )}
            <label className="block"><span className="label">Taille</span>
              <select name="size" defaultValue={sp.size ?? ""} className="field !py-2"><option value="">Toutes</option>{SIZES.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}</select>
            </label>
            <label className="block"><span className="label">Liste de diffusion</span>
              <select name="list" defaultValue={sp.list ?? ""} className="field !py-2"><option value="">Toutes</option>{lists.map((l) => <option key={l.id} value={l.id}>{l.name} ({nf.format(l._count.members)})</option>)}</select>
            </label>
            <label className="block"><span className="label">Segment</span>
              <select name="segment" defaultValue={sp.segment ?? ""} className="field !py-2"><option value="">Tous</option>{SEGMENTS.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}</select>
            </label>
            <label className="block"><span className="label">Étiquette</span>
              <select name="tag" defaultValue={sp.tag ?? ""} className="field !py-2"><option value="">Toutes</option>{tagRows.map((t) => <option key={t.tag} value={t.tag}>{t.tag} ({nf.format(Number(t.n))})</option>)}</select>
            </label>
            <div className="flex flex-col justify-end gap-1.5 pb-1 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" name="tel" value="1" defaultChecked={!!sp.tel} className="h-4 w-4 accent-brand-500" /> Avec téléphone</label>
              <label className="flex items-center gap-2"><input type="checkbox" name="reach" value="1" defaultChecked={!!sp.reach} className="h-4 w-4 accent-brand-500" /> Joignables par e-mail</label>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button className="btn-primary !py-2">Appliquer les filtres</button>
            <Link href={qs({ q: undefined, region: undefined, dep: undefined, stars: undefined, size: undefined, list: undefined, segment: undefined, tag: undefined, tel: undefined, reach: undefined })} className="btn-ghost !py-2 text-ink">Réinitialiser</Link>
          </div>
        </details>
      </form>

      {(active.length > 0 || cats.length > 0) && (
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-ink/55">{nf.format(total)} résultat(s) :</span>
          {cats.map((c) => <Link key={c} href={toggleCat(c)} className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 font-medium text-brand-800">{c === NO_CATEGORY ? "Sans catégorie" : categoryLabel(c)} <X className="h-3.5 w-3.5" /></Link>)}
          {active.map(([k, label]) => <Link key={k} href={qs({ [k]: undefined, ...(k === "region" ? { dep: undefined } : {}) })} className="inline-flex items-center gap-1 rounded-full bg-ink/5 px-3 py-1 font-medium">{label} <X className="h-3.5 w-3.5" /></Link>)}
          <Link href="/admin/contacts" className="text-xs font-semibold text-ink/50 underline">Tout effacer</Link>
        </div>
      )}

      {!contacts.length ? (
        <Empty>Aucun contact. Les demandes du site créent automatiquement des contacts ; vous pouvez aussi importer un fichier.</Empty>
      ) : pipeline ? (
        <div className="-mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-4 lg:mx-0 lg:grid lg:grid-cols-6 lg:px-0">
          {STATUSES.map((s) => (
            <div key={s.key} className="w-[78vw] max-w-72 shrink-0 snap-start rounded-2xl lg:w-auto lg:max-w-none lg:min-w-0 bg-white/60 p-2 ring-1 ring-ink/5">
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
            <input type="hidden" name="filters" value={JSON.stringify(filters)} />
            <select name="scope" className="field max-w-[15rem] !py-2" defaultValue="selection">
              <option value="selection">Contacts cochés</option>
              <option value="filter">Les {nf.format(total)} résultats du filtre</option>
            </select>
            <select name="action" className="field max-w-[13rem] !py-2" defaultValue="">
              <option value="" disabled>Action…</option>
              <option value="list">Ajouter à la liste (nom)</option>
              <option value="unlist">Retirer de la liste (nom)</option>
              <option value="tag">Ajouter l'étiquette</option>
              <option value="untag">Retirer l'étiquette</option>
              <option value="status">Changer le statut (clé)</option>
              <option value="segment">Changer le segment (clé)</option>
              <option value="category">Changer la catégorie</option>
              <option value="delete">Supprimer (contacts cochés)</option>
            </select>
            <input name="value" placeholder="nom de liste, étiquette, statut, catégorie…" className="field max-w-xs !py-2" />
            <button className="btn-dark !py-2">Appliquer</button>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-sand text-left text-xs text-ink/55 uppercase">
                <tr><th className="p-3"><SelectAll /></th><th className="p-3">Contact</th><th className="hidden p-3 md:table-cell">Société</th><th className="hidden p-3 md:table-cell">Catégorie</th><th className="p-3">Statut</th><th className="hidden p-3 lg:table-cell">Étiquettes</th><th className="hidden p-3 md:table-cell">Dernier contact</th></tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {contacts.map((c) => (
                  <tr key={c.id} className="hover:bg-sand/50">
                    <td className="p-3"><input type="checkbox" name="ids" value={c.id} className="h-4 w-4 accent-brand-500" /></td>
                    <td className="p-3">
                      <Link href={`/admin/contacts/${c.id}`} className="font-semibold hover:text-brand-600">{[c.firstName, c.lastName].filter(Boolean).join(" ") || "—"}</Link>
                      <span className="block max-w-[52vw] truncate text-xs text-ink/50 md:max-w-none">{c.email}{c.unsubscribed && " · désinscrit"}{c.bounced && " · adresse invalide"}</span>
                      {(c.company || c.category) && <span className="block max-w-[52vw] truncate text-xs text-ink/45 md:hidden">{[c.company, c.category && categoryLabel(c.category), c.city].filter(Boolean).join(" · ")}</span>}
                    </td>
                    <td className="hidden p-3 text-ink/70 md:table-cell">{c.company ?? "—"}{(c.city || c.department) && <span className="block text-xs text-ink/45">{[c.city, c.department && `(${c.department})`].filter(Boolean).join(" ")}</span>}</td>
                    <td className="hidden p-3 md:table-cell">{c.category ? <Link href={toggleCat(c.category)} className="text-xs font-medium text-brand-700">{categoryLabel(c.category)}</Link> : <span className="text-xs text-ink/35">—</span>}{c.stars && <span className="block text-xs text-amber-500">{"★".repeat(c.stars)}</span>}</td>
                    <td className="p-3"><Badge tone={STATUS[c.status]?.tone}>{STATUS[c.status]?.label ?? c.status}</Badge></td>
                    <td className="hidden p-3 lg:table-cell"><div className="flex flex-wrap gap-1">{c.tags.slice(0, 4).map((t) => <Link key={t} href={qs({ tag: t })} className="rounded-full bg-ink/5 px-2 py-0.5 text-xs">{t}</Link>)}</div></td>
                    <td className="hidden p-3 text-xs whitespace-nowrap text-ink/55 md:table-cell">{c.lastContactAt?.toLocaleDateString("fr-FR") ?? "—"}</td>
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
