import { NewButton, Notice, PageTitle, SimpleList } from "@/components/admin/ui";
import { db } from "@/lib/db";

export const metadata = { title: "Réalisations" };

export default async function ProjectsAdmin({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const list = await db.project.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <>
      <PageTitle title="Réalisations" subtitle="Les 3 exemples de l'ancien site sont masqués (textes génériques) : remplacez-les par vos vrais projets." action={<NewButton href="/admin/realisations/nouveau" label="Nouvelle réalisation" />} />
      <Notice ok={(await searchParams).ok} />
      <SimpleList base="/admin/realisations" items={list.map((p) => ({ id: p.id, title: p.title, subtitle: [p.location, p.date].filter(Boolean).join(" · "), image: p.image, online: p.published }))} />
    </>
  );
}
