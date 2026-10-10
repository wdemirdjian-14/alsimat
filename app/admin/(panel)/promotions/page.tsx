import { NewButton, Notice, PageTitle, SimpleList } from "@/components/admin/ui";
import { db } from "@/lib/db";

export const metadata = { title: "Promotions" };

export default async function PromosAdmin({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const list = await db.promotion.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] });
  const now = new Date();
  return (
    <>
      <PageTitle title="Promotions" subtitle="La rubrique apparaît sur le site dès qu'une promotion est active." action={<NewButton href="/admin/promotions/nouveau" label="Nouvelle promotion" />} />
      <Notice ok={(await searchParams).ok} />
      <SimpleList base="/admin/promotions" items={list.map((p) => ({ id: p.id, title: p.title, subtitle: p.endsAt ? `Jusqu'au ${p.endsAt.toLocaleDateString("fr-FR")}` : p.discount, image: p.image, online: p.active && (!p.endsAt || p.endsAt > now), extra: p.endsAt && p.endsAt <= now ? "Expirée" : undefined }))} />
    </>
  );
}
