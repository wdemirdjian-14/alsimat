import Link from "next/link";
import { Trash2, Upload } from "lucide-react";
import { SubmitButton } from "@/components/admin/form-parts";
import { Card, Empty, Field, Notice, PageTitle } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { deleteList, saveList } from "../../actions/crm";

export const metadata = { title: "Listes de diffusion" };

export default async function ListsPage({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const lists = await db.contactList.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { members: true } } } });
  const reachable = await db.listMember.groupBy({ by: ["listId"], where: { contact: { unsubscribed: false, bounced: false } }, _count: true });
  return (
    <>
      <PageTitle title="Listes de diffusion" subtitle="Classez vos contacts par fichier, secteur, salon… puis ciblez une ou plusieurs listes dans vos campagnes."
        action={<Link href="/admin/contacts/import" className="btn-primary !py-2.5"><Upload className="h-4 w-4" /> Importer une liste</Link>} />
      <Notice ok={(await searchParams).ok} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {lists.length ? (
            <ul className="divide-y divide-ink/5 rounded-2xl border border-ink/10 bg-white">
              {lists.map((l) => (
                <li key={l.id} className="flex items-center gap-4 p-4">
                  <span className="h-4 w-4 shrink-0 rounded-full" style={{ background: l.color }} />
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/contacts?list=${l.id}`} className="font-semibold hover:text-brand-600">{l.name}</Link>
                    {l.description && <p className="text-xs text-ink/55">{l.description}</p>}
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-display text-xl font-extrabold">{l._count.members}</p>
                    <p className="text-xs text-ink/50">{reachable.find((r) => r.listId === l.id)?._count ?? 0} joignables</p>
                  </div>
                  <form action={deleteList.bind(null, l.id)}><button aria-label="Supprimer la liste (les contacts sont conservés)" title="Supprimer la liste (les contacts sont conservés)" className="text-red-600"><Trash2 className="h-4 w-4" /></button></form>
                </li>
              ))}
            </ul>
          ) : <Empty>Aucune liste. Créez-en une ou importez un fichier : les listes du fichier sont créées automatiquement.</Empty>}
        </div>
        <Card title="Nouvelle liste" className="self-start">
          <form action={saveList.bind(null, null)} className="space-y-3">
            <Field label="Nom" name="name" required placeholder="Campings Bretagne" />
            <Field label="Description" name="description" placeholder="Source, date, usage…" />
            <label className="block"><span className="label">Couleur</span><input type="color" name="color" defaultValue="#46a584" className="h-10 w-16 rounded" /></label>
            <SubmitButton label="Créer" />
          </form>
        </Card>
      </div>
    </>
  );
}
