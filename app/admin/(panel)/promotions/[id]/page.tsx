import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton, SubmitButton } from "@/components/admin/form-parts";
import { ImageInput } from "@/components/admin/image-input";
import { Card, Field, Notice, PageTitle, TextArea, Toggle } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { deletePromotion, savePromotion } from "../../../actions/content";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string }> };

export default async function PromoEdit({ params, searchParams }: Props) {
  const { id } = await params;
  const p = id === "nouveau" ? null : await db.promotion.findUnique({ where: { id } });
  if (id !== "nouveau" && !p) notFound();
  return (
    <>
      <PageTitle title={p ? p.title : "Nouvelle promotion"} action={<Link href="/admin/promotions" className="text-sm font-semibold text-brand-600">← Liste</Link>} />
      <Notice ok={(await searchParams).ok} />
      <form action={savePromotion.bind(null, p?.id ?? null)} className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Offre">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Titre" name="title" defaultValue={p?.title} required className="sm:col-span-2" />
              <Field label="Remise / prix" name="discount" defaultValue={p?.discount} placeholder="-10 %" />
              <Field label="Badge" name="badge" defaultValue={p?.badge} placeholder="Offre de printemps" />
              <TextArea className="sm:col-span-2" label="Description" name="description" defaultValue={p?.description} rows={5} />
              <Field label="Texte du bouton" name="ctaLabel" defaultValue={p?.ctaLabel} placeholder="J'en profite" />
              <Field label="Lien du bouton" name="ctaLink" defaultValue={p?.ctaLink} placeholder="/vehicules/link-4-flex" />
            </div>
          </Card>
          <Card title="Image"><ImageInput name="image" defaultValue={p?.image ? [p.image] : []} /></Card>
        </div>
        <Card title="Publication" className="self-start">
          <div className="space-y-3">
            <Toggle label="Active" name="active" defaultChecked={p?.active ?? true} />
            <Field label="Fin de l'offre (facultatif)" name="endsAt" type="date" defaultValue={p?.endsAt?.toISOString().slice(0, 10)} hint="Masquée automatiquement après cette date." />
            <Field label="Ordre" name="order" type="number" defaultValue={p?.order ?? 0} />
            <SubmitButton />
          </div>
        </Card>
      </form>
      {p && <div className="mt-8 border-t border-ink/10 pt-6"><DeleteButton action={deletePromotion.bind(null, p.id)} /></div>}
    </>
  );
}
