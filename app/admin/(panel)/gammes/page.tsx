import Image from "next/image";
import Link from "next/link";
import { Badge, NewButton, Notice, PageTitle } from "@/components/admin/ui";
import { db } from "@/lib/db";

export const metadata = { title: "Gammes" };

export default async function CategoriesAdmin({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const cats = await db.category.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }], include: { _count: { select: { vehicles: true } } } });
  const roots = cats.filter((c) => !c.parentId);
  const row = (c: (typeof cats)[0], child = false) => (
    <li key={c.id}>
      <Link href={`/admin/gammes/${c.id}`} className={`flex items-center gap-4 p-3 hover:bg-sand/60 ${child ? "pl-12" : ""}`}>
        <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-sand">{c.image && <Image src={c.image} alt="" fill sizes="64px" className="object-cover" />}</span>
        <span className="flex-1 font-semibold">{c.name}<span className="block text-xs font-normal text-ink/50">/gammes/{c.slug}</span></span>
        <span className="text-sm text-ink/60">{c._count.vehicles} véhicule(s)</span>
        {c.published ? <Badge tone="green">En ligne</Badge> : <Badge>Masquée</Badge>}
      </Link>
    </li>
  );
  return (
    <>
      <PageTitle title="Gammes" subtitle="Catégories et sous-catégories du catalogue." action={<NewButton href="/admin/gammes/nouveau" label="Nouvelle gamme" />} />
      <Notice ok={(await searchParams).ok} />
      <ul className="divide-y divide-ink/5 rounded-2xl border border-ink/10 bg-white">
        {roots.flatMap((r) => [row(r), ...cats.filter((c) => c.parentId === r.id).map((c) => row(c, true))])}
      </ul>
    </>
  );
}
