import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton, SubmitButton } from "@/components/admin/form-parts";
import { ImageInput } from "@/components/admin/image-input";
import { Card, Field, Notice, PageTitle, TextArea, Toggle } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { deleteArticle, saveArticle } from "../../../actions/content";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string }> };

export default async function ArticleEdit({ params, searchParams }: Props) {
  const { id } = await params;
  const a = id === "nouveau" ? null : await db.article.findUnique({ where: { id } });
  if (id !== "nouveau" && !a) notFound();
  return (
    <>
      <PageTitle title={a ? a.title : "Nouvel article"} action={<Link href="/admin/conseils" className="text-sm font-semibold text-brand-600">← Liste</Link>} />
      <Notice ok={(await searchParams).ok} />
      <form action={saveArticle.bind(null, a?.id ?? null)} className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Article">
            <div className="grid gap-4">
              <Field label="Titre" name="title" defaultValue={a?.title} required />
              <TextArea label="Chapeau (résumé)" name="excerpt" defaultValue={a?.excerpt} rows={3} />
              <TextArea label="Contenu" name="content" defaultValue={a?.content} rows={22} required
                hint="Mise en forme : « ## Titre » pour un intertitre, « - » pour une liste, **gras**, [texte du lien](/gammes/bus). Paragraphes séparés par une ligne vide." />
            </div>
          </Card>
          <Card title="Image"><ImageInput name="image" defaultValue={a?.image ? [a.image] : []} /></Card>
          <Card title="Référencement (facultatif)">
            <div className="grid gap-4">
              <Field label="Titre Google" name="seoTitle" defaultValue={a?.seoTitle} />
              <TextArea label="Description Google" name="seoDescription" defaultValue={a?.seoDescription} rows={2} />
              <Field label="Adresse (slug)" name="slug" defaultValue={a?.slug} />
            </div>
          </Card>
        </div>
        <Card title="Publication" className="self-start">
          <div className="space-y-3">
            <Toggle label="Publié" name="published" defaultChecked={a?.published ?? true} />
            <Field label="Date de publication" name="publishedAt" type="date" defaultValue={(a?.publishedAt ?? new Date()).toISOString().slice(0, 10)} hint="Une date future programme l'article." />
            <SubmitButton />
          </div>
        </Card>
      </form>
      {a && <div className="mt-8 border-t border-ink/10 pt-6"><DeleteButton action={deleteArticle.bind(null, a.id)} /></div>}
    </>
  );
}
