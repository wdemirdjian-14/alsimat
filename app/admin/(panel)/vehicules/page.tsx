import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Badge, Empty, NewButton, Notice, PageTitle } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Véhicules" };

type Props = { searchParams: Promise<{ q?: string; cat?: string; ok?: string }> };

export default async function VehiclesAdmin({ searchParams }: Props) {
  const { q, cat, ok } = await searchParams;
  const [vehicles, cats] = await Promise.all([
    db.vehicle.findMany({
      where: {
        ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
        ...(cat === "none" ? { categories: { none: {} } } : cat ? { categories: { some: { categoryId: cat } } } : {}),
      },
      include: { categories: { include: { category: true } } },
      orderBy: [{ published: "desc" }, { order: "asc" }, { name: "asc" }],
    }),
    db.category.findMany({ orderBy: { order: "asc" } }),
  ]);
  return (
    <>
      <PageTitle title="Véhicules" subtitle={`${vehicles.length} véhicule(s)`} action={<NewButton href="/admin/vehicules/nouveau" label="Nouveau véhicule" />} />
      <Notice ok={ok} />
      <form className="mb-6 flex flex-wrap gap-3">
        <input name="q" defaultValue={q} placeholder="Rechercher un modèle…" className="field max-w-xs" />
        <select name="cat" defaultValue={cat ?? ""} className="field max-w-xs">
          <option value="">Toutes les gammes</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          <option value="none">Sans gamme</option>
        </select>
        <button className="btn-dark !py-2.5">Filtrer</button>
      </form>
      {vehicles.length ? (
        <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-sand text-left text-xs text-ink/55 uppercase">
              <tr><th className="p-3">Modèle</th><th className="p-3">Gammes</th><th className="p-3">Prix</th><th className="p-3">Statut</th></tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {vehicles.map((v) => (
                <tr key={v.id} className="hover:bg-sand/60">
                  <td className="p-3">
                    <Link href={`/admin/vehicules/${v.id}`} className="flex items-center gap-3 font-semibold hover:text-brand-600">
                      <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-sand">{v.images[0] && <Image src={v.images[0]} alt="" fill sizes="64px" className="object-cover" />}</span>
                      {v.name}
                      {v.featured && <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-label="Mis en avant" />}
                    </Link>
                  </td>
                  <td className="p-3 text-xs text-ink/60">{v.categories.map((c) => c.category.name).join(", ") || "—"}</td>
                  <td className="p-3 whitespace-nowrap">{formatPrice(v.price)}</td>
                  <td className="p-3">{v.published ? <Badge tone="green">En ligne</Badge> : <Badge>Masqué</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>Aucun véhicule trouvé.</Empty>
      )}
    </>
  );
}
