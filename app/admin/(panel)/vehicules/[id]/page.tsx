import Link from "next/link";
import { notFound } from "next/navigation";
import { Copy, ExternalLink } from "lucide-react";
import { DeleteButton, SubmitButton } from "@/components/admin/form-parts";
import { FileInput } from "@/components/admin/file-input";
import { ImageInput } from "@/components/admin/image-input";
import { Card, Field, Notice, PageTitle, TextArea, Toggle } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { deleteVehicle, duplicateVehicle, saveVehicle } from "../../../actions/catalog";
import { specsToText } from "../../../actions/helpers";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string }> };

export default async function VehicleEdit({ params, searchParams }: Props) {
  const { id } = await params;
  const isNew = id === "nouveau";
  const [v, cats] = await Promise.all([
    isNew ? null : db.vehicle.findUnique({ where: { id }, include: { categories: true } }),
    db.category.findMany({ orderBy: [{ parentId: "asc" }, { order: "asc" }] }),
  ]);
  if (!isNew && !v) notFound();
  const selected = new Set(v?.categories.map((c) => c.categoryId));
  return (
    <>
      <PageTitle
        title={v ? v.name : "Nouveau véhicule"}
        action={
          <div className="flex gap-3 text-sm font-semibold">
            <Link href="/admin/vehicules" className="text-brand-600">← Liste</Link>
            {v?.published && <a href={`/vehicules/${v.slug}`} target="_blank" className="flex items-center gap-1 text-brand-600">Voir <ExternalLink className="h-3.5 w-3.5" /></a>}
          </div>
        }
      />
      <Notice ok={(await searchParams).ok} />
      <form action={saveVehicle.bind(null, v?.id ?? null)} className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Informations">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nom du modèle" name="name" defaultValue={v?.name} required />
              <Field label="Prix" name="price" defaultValue={v?.price} placeholder="9 500 € HT" hint="Laisser vide pour « Prix sur demande »" />
              <TextArea className="sm:col-span-2" label="Accroche (résumé)" name="shortDescription" defaultValue={v?.shortDescription} rows={3} hint="Affichée en haut de la fiche et utilisée par Google si aucune description SEO n'est fournie." />
              <TextArea className="sm:col-span-2" label="Description complète" name="description" defaultValue={v?.description} rows={12} hint="Un paragraphe par ligne vide." />
            </div>
          </Card>
          <Card title="Caractéristiques techniques">
            <TextArea label="Une caractéristique par ligne, au format « Nom : valeur »" name="characteristics" defaultValue={specsToText(v?.characteristics)} rows={8}
              hint="Utilisez de préférence : Places, Autonomie, Vitesse maximale, Moteur, Batterie, Permis de conduire (utilisés par les filtres du catalogue)." />
          </Card>
          <Card title="Photos">
            <ImageInput name="images" multiple defaultValue={v?.images ?? []} hint="La première photo est l'image principale. Les images sont automatiquement converties et compressées." />
          </Card>
          <Card title="Page vitrine (mise en avant)">
            <p className="mb-4 text-sm text-ink/55">
              Cochez « À la une » dans Publication pour afficher la page vitrine animée (vidéo, chiffres clés, benne, batterie, personnalisation) et le bloc sur l'accueil (2 modèles maximum).
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextArea className="sm:col-span-2" label="Accroche" name="tagline" defaultValue={v?.tagline} rows={2} hint="Une phrase percutante affichée sous le titre." />
              <Field label="Référence constructeur" name="sku" defaultValue={v?.sku} placeholder="AL202EH" />
              <div />
              <FileInput name="video" label="Vidéo (MP4)" accept="video/mp4,video/webm" defaultValue={v?.video} hint="Courte (5 à 20 s), sans son, 25 Mo max. Jouée en boucle en fond." />
              <FileInput name="datasheet" label="Fiche technique (PDF)" accept="application/pdf" defaultValue={v?.datasheet} />
              <TextArea className="sm:col-span-2" label="Équipement de série (un par ligne)" name="equipment" defaultValue={v?.equipment} rows={6} />
              <Field label="Coloris carrosserie (séparés par des virgules)" name="colors" defaultValue={v?.colors.join(", ")} placeholder="Blanc, Noir, Bleu, Personnalisée" />
              <Field label="Selleries (séparées par des virgules)" name="upholstery" defaultValue={v?.upholstery.join(", ")} placeholder="Caramel, Noir & gris" />
            </div>
          </Card>
          <Card title="Référencement (facultatif)">
            <div className="grid gap-4">
              <Field label="Titre Google" name="seoTitle" defaultValue={v?.seoTitle} hint="60 caractères max. Par défaut : nom + type + places + prix." />
              <TextArea label="Description Google" name="seoDescription" defaultValue={v?.seoDescription} rows={2} hint="155 caractères max." />
              <Field label="Adresse de la page (slug)" name="slug" defaultValue={v?.slug} hint="Générée automatiquement depuis le nom. Changer l'adresse d'une page déjà indexée fait perdre son référencement." />
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card title="Publication">
            <div className="space-y-3">
              <Toggle label="En ligne" name="published" defaultChecked={v?.published ?? true} />
              <Toggle label="À la une (page vitrine)" name="spotlight" defaultChecked={v?.spotlight} hint="Bloc vedette sur l'accueil + page produit animée." />
              <Toggle label="Mis en avant" name="featured" defaultChecked={v?.featured} hint="Affiché dans « Nos modèles phares »." />
              <Field label="Ordre d'affichage" name="order" type="number" defaultValue={v?.order ?? 0} />
            </div>
            <div className="mt-5"><SubmitButton /></div>
          </Card>
          <Card title="Gammes">
            <div className="space-y-2">
              {cats.map((c) => (
                <label key={c.id} className={`flex items-center gap-3 text-sm ${c.parentId ? "pl-6" : "font-semibold"}`}>
                  <input type="checkbox" name="categories" value={c.id} defaultChecked={selected.has(c.id)} className="h-4 w-4 accent-brand-500" /> {c.name}
                </label>
              ))}
            </div>
          </Card>
        </div>
      </form>
      {v && (
        <div className="mt-8 flex flex-wrap gap-3 border-t border-ink/10 pt-6">
          <form action={duplicateVehicle.bind(null, v.id)}><button className="btn-ghost !py-2.5 text-ink"><Copy className="h-4 w-4" /> Dupliquer</button></form>
          <DeleteButton action={deleteVehicle.bind(null, v.id)} />
        </div>
      )}
    </>
  );
}
