import { NewButton, Notice, PageTitle, SimpleList } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Occasion" };

export default async function UsedAdmin({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const list = await db.usedVehicle.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <>
      <PageTitle title="Véhicules d'occasion" subtitle="La rubrique apparaît sur le site dès qu'un véhicule est en ligne." action={<NewButton href="/admin/occasion/nouveau" label="Ajouter" />} />
      <Notice ok={(await searchParams).ok} />
      <SimpleList base="/admin/occasion" items={list.map((v) => ({ id: v.id, title: v.name, subtitle: [formatPrice(v.price), v.year].filter(Boolean).join(" · "), image: v.images[0], online: v.published, extra: v.sold ? "Vendu" : undefined }))} />
    </>
  );
}
