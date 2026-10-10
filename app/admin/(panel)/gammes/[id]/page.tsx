import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton, SubmitButton } from "@/components/admin/form-parts";
import { ImageInput } from "@/components/admin/image-input";
import { Card, Field, Notice, PageTitle, Select, TextArea, Toggle } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { deleteCategory, saveCategory } from "../../../actions/catalog";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string }> };

export default async function CategoryEdit({ params, searchParams }: Props) {
  const { id } = await params;
  const isNew = id === "nouveau";
  const [c, roots] = await Promise.all([
    isNew ? null : db.category.findUnique({ where: { id } }),
    db.category.findMany({ where: { parentId: null, NOT: { id } }, orderBy: { order: "asc" } }),
  ]);
  if (!isNew && !c) notFound();
  return (
    <>
      <PageTitle title={c ? c.name : "Nouvelle gamme"} action={<Link href="/admin/gammes" className="text-sm font-semibold text-brand-600">← Liste</Link>} />
      <Notice ok={(await searchParams).ok} />
      <form action={saveCategory.bind(null, c?.id ?? null)} className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Informations">
            <div className="grid gap-4">
              <Field label="Nom" name="name" defaultValue={c?.name} required />
              <TextArea label="Description courte" name="description" defaultValue={c?.description} rows={3} hint="Affichée dans le bandeau de la page de gamme." />
              <TextArea label="Texte de présentation (bas de page)" name="intro" defaultValue={c?.intro} rows={8} hint="Texte riche en mots-clés pour le référencement. Titres : commencer la ligne par « ## »." />
            </div>
          </Card>
          <Card title="Image"><ImageInput name="image" defaultValue={c?.image ? [c.image] : []} /></Card>
          <Card title="Référencement (facultatif)">
            <div className="grid gap-4">
              <Field label="Titre Google" name="seoTitle" defaultValue={c?.seoTitle} />
              <TextArea label="Description Google" name="seoDescription" defaultValue={c?.seoDescription} rows={2} />
              <Field label="Adresse (slug)" name="slug" defaultValue={c?.slug} hint="Changer l'adresse d'une page indexée fait perdre son référencement." />
            </div>
          </Card>
        </div>
        <Card title="Publication" className="self-start">
          <div className="space-y-4">
            <Toggle label="En ligne" name="published" defaultChecked={c?.published ?? true} />
            <Select label="Gamme parente" name="parentId" defaultValue={c?.parentId} options={[{ value: "", label: "— Aucune (gamme principale)" }, ...roots.map((r) => ({ value: r.id, label: r.name }))]} />
            <Field label="Ordre d'affichage" name="order" type="number" defaultValue={c?.order ?? 0} />
            <SubmitButton />
          </div>
        </Card>
      </form>
      {c && <div className="mt-8 border-t border-ink/10 pt-6"><DeleteButton action={deleteCategory.bind(null, c.id)} confirmText="Supprimer cette gamme ? Les véhicules ne sont pas supprimés." /></div>}
    </>
  );
}
