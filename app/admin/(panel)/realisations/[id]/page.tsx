import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton, SubmitButton } from "@/components/admin/form-parts";
import { ImageInput } from "@/components/admin/image-input";
import { Card, Field, Notice, PageTitle, TextArea, Toggle } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { deleteProject, saveProject } from "../../../actions/content";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string }> };

export default async function ProjectEdit({ params, searchParams }: Props) {
  const { id } = await params;
  const p = id === "nouveau" ? null : await db.project.findUnique({ where: { id } });
  if (id !== "nouveau" && !p) notFound();
  return (
    <>
      <PageTitle title={p ? p.title : "Nouvelle réalisation"} action={<Link href="/admin/realisations" className="text-sm font-semibold text-brand-600">← Liste</Link>} />
      <Notice ok={(await searchParams).ok} />
      <form action={saveProject.bind(null, p?.id ?? null)} className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Projet">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Titre" name="title" defaultValue={p?.title} required className="sm:col-span-2" />
              <Field label="Lieu" name="location" defaultValue={p?.location} placeholder="Camping des Pins, Landes" />
              <Field label="Date" name="date" defaultValue={p?.date} placeholder="Mai 2026" />
              <TextArea className="sm:col-span-2" label="Description" name="description" defaultValue={p?.description} rows={8} />
            </div>
          </Card>
          <Card title="Photo"><ImageInput name="image" defaultValue={p?.image ? [p.image] : []} /></Card>
        </div>
        <Card title="Publication" className="self-start">
          <div className="space-y-3">
            <Toggle label="En ligne" name="published" defaultChecked={p?.published ?? true} />
            <Field label="Adresse (slug)" name="slug" defaultValue={p?.slug} />
            <SubmitButton />
          </div>
        </Card>
      </form>
      {p && <div className="mt-8 border-t border-ink/10 pt-6"><DeleteButton action={deleteProject.bind(null, p.id)} /></div>}
    </>
  );
}
