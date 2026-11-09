import Link from "next/link";
import { Card, PageTitle } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { ImportForm } from "./import-form";

export const metadata = { title: "Importer des contacts" };

export default async function ImportPage() {
  const lists = await db.contactList.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
  return (
    <>
      <PageTitle title="Importer des prospects" action={<Link href="/admin/contacts" className="text-sm font-semibold text-brand-600">← Contacts</Link>} />
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3"><ImportForm lists={lists} /></Card>
        <Card title="Format du fichier" className="text-sm lg:col-span-2">
          <p>Fichier <strong>Excel (.xlsx)</strong> ou <strong>CSV</strong>, avec une ligne d'en-tête. <a href="/admin/contacts/modele" className="font-semibold text-brand-600 underline">Télécharger le modèle</a>. Colonnes reconnues automatiquement :</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-ink-soft">
            <li><strong>E-mail</strong> (obligatoire)</li><li>Prénom, Nom</li><li>Société / Entreprise / Établissement</li><li>Fonction / Poste</li>
            <li>Téléphone / Mobile</li><li>Ville, Code postal, <strong>Département</strong>, <strong>Région</strong> (→ étiquettes dep-xx, region-xx)</li>
            <li><strong>Liste</strong> : liste(s) de diffusion, plusieurs séparées par <code>|</code> (créées automatiquement)</li>
            <li><strong>Catégorie</strong> / Type / Secteur / Étiquettes (→ étiquettes)</li><li>Site web, Source, Origine, Notes, Segment</li>
          </ul>
          <p className="mt-4 text-ink-soft">Les doublons (même e-mail) sont fusionnés. Un contact désinscrit le reste, même s'il figure dans le fichier.</p>
          <p className="mt-4 rounded-xl bg-amber-50 p-3 text-amber-800">RGPD : la prospection par e-mail sans accord préalable n'est autorisée que vers des <strong>professionnels</strong>, pour une offre en rapport avec leur activité. Conservez la preuve de l'origine de vos fichiers.</p>
        </Card>
      </div>
    </>
  );
}
