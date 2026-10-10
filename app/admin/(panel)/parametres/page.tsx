import { SubmitButton } from "@/components/admin/form-parts";
import { Card, Field, Notice, PageTitle, Toggle } from "@/components/admin/ui";
import { getSetting } from "@/lib/settings";
import { saveSettings } from "../../actions/content";

export const metadata = { title: "Paramètres" };

const LABELS: Record<string, string> = {
  name: "Nom commercial", legalName: "Raison sociale", tagline: "Accroche", phone: "Téléphone", email: "E-mail de contact",
  street: "Adresse (rue)", postalCode: "Code postal", city: "Ville", region: "Région", hours: "Horaires",
  serviceArea: "Zone d'intervention", siret: "SIRET", director: "Directeur de la publication",
  linkedin: "Page LinkedIn (URL)", facebook: "Page Facebook (URL)", instagram: "Compte Instagram (URL)",
};

export default async function SettingsAdmin({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const [visibility, company] = await Promise.all([getSetting("visibility"), getSetting("company")]);
  return (
    <>
      <PageTitle title="Paramètres" />
      <Notice ok={(await searchParams).ok} />
      <form action={saveSettings} className="space-y-8">
        <Card title="Rubriques du site">
          <p className="mb-4 text-sm text-ink/55">Une rubrique activée n'apparaît que si elle contient au moins un élément en ligne.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Toggle label="Occasion" name="v_occasion" defaultChecked={visibility.occasion} />
            <Toggle label="Promotions" name="v_promotions" defaultChecked={visibility.promotions} />
            <Toggle label="Réalisations" name="v_realisations" defaultChecked={visibility.realisations} />
            <Toggle label="Conseils (blog)" name="v_conseils" defaultChecked={visibility.conseils} />
          </div>
        </Card>
        <Card title="Entreprise">
          <p className="mb-4 text-sm text-ink/55">
            Ces informations alimentent l'en-tête, le pied de page, les mentions légales et la fiche « entreprise » lue par Google.
            <strong className="text-ink"> Renseignez l'adresse complète : c'est essentiel pour le référencement local.</strong>
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.entries(company).map(([k, v]) => <Field key={k} label={LABELS[k] ?? k} name={`c_${k}`} defaultValue={v} />)}
          </div>
        </Card>
        <SubmitButton />
      </form>
    </>
  );
}
