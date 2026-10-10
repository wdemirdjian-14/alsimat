import { NewButton, Notice, PageTitle, SimpleList } from "@/components/admin/ui";
import { db } from "@/lib/db";

export const metadata = { title: "Conseils" };

export default async function ArticlesAdmin({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const list = await db.article.findMany({ orderBy: { publishedAt: "desc" } });
  const now = new Date();
  return (
    <>
      <PageTitle title="Conseils (blog)" subtitle="Des articles réguliers sur vos sujets d'expertise améliorent fortement le référencement." action={<NewButton href="/admin/conseils/nouveau" label="Nouvel article" />} />
      <Notice ok={(await searchParams).ok} />
      <SimpleList base="/admin/conseils" items={list.map((a) => ({ id: a.id, title: a.title, subtitle: a.publishedAt.toLocaleDateString("fr-FR"), image: a.image, online: a.published && a.publishedAt <= now, extra: a.published && a.publishedAt > now ? "Programmé" : undefined }))} />
    </>
  );
}
