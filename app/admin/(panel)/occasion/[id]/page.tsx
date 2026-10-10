import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton, SubmitButton } from "@/components/admin/form-parts";
import { ImageInput } from "@/components/admin/image-input";
import { Card, Field, Notice, PageTitle, TextArea, Toggle } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { deleteUsed, saveUsed } from "../../../actions/content";
import { specsToText } from "../../../actions/helpers";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string }> };

export default async function UsedEdit({ params, searchParams }: Props) {
  const { id } = await params;
  const v = id === "nouveau" ? null : await db.usedVehicle.findUnique({ where: { id } });
  if (id !== "nouveau" && !v) notFound();
  return (
    <>
      <PageTitle title={v ? v.name : "Nouveau véhicule d'occasion"} action={<Link href="/admin/occasion" className="text-sm font-semibold text-brand-600">← Liste</Link>} />
      <Notice ok={(await searchParams).ok} />
      <form action={saveUsed.bind(null, v?.id ?? null)} className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Informations">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nom" name="name" defaultValue={v?.name} required className="sm:col-span-2" />
              <Field label="Prix" name="price" defaultValue={v?.price} placeholder="6 900 € HT" />
              <Field label="Année" name="year" defaultValue={v?.year} />
              <Field label="Heures / kilométrage" name="mileage" defaultValue={v?.mileage} />
              <Field label="État" name="condition" defaultValue={v?.condition} placeholder="Très bon état" />
              <TextArea className="sm:col-span-2" label="Description" name="description" defaultValue={v?.description} rows={8} />
              <TextArea className="sm:col-span-2" label="Caractéristiques (« Nom : valeur » par ligne)" name="characteristics" defaultValue={specsToText(v?.characteristics)} rows={5} />
            </div>
          </Card>
          <Card title="Photos"><ImageInput name="images" multiple defaultValue={v?.images ?? []} /></Card>
        </div>
        <Card title="Publication" className="self-start">
          <div className="space-y-3">
            <Toggle label="En ligne" name="published" defaultChecked={v?.published ?? true} />
            <Toggle label="Vendu" name="sold" defaultChecked={v?.sold} hint="Reste visible avec la mention « Vendu »." />
            <Field label="Adresse (slug)" name="slug" defaultValue={v?.slug} />
            <SubmitButton />
          </div>
        </Card>
      </form>
      {v && <div className="mt-8 border-t border-ink/10 pt-6"><DeleteButton action={deleteUsed.bind(null, v.id)} /></div>}
    </>
  );
}
