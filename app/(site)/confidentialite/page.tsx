import { LegalPage } from "@/components/site/legal-page";
import { pageMetadata } from "@/lib/seo";
import { getCompany } from "@/lib/settings";

export const metadata = pageMetadata({ title: "Politique de confidentialité", description: "Comment Alsimat traite vos données personnelles.", path: "/confidentialite" });

export default async function PrivacyPage() {
  const c = await getCompany();
  return (
    <LegalPage title="Politique de confidentialité" path="/confidentialite">
      <h2>Données collectées</h2>
      <p>Lorsque vous utilisez nos formulaires (devis, contact, SAV), nous collectons les informations que vous saisissez : nom, prénom, coordonnées, société, message et, pour le SAV, le numéro de série et les fichiers joints.</p>
      <h2>Finalités</h2>
      <p>Ces données servent uniquement à répondre à votre demande, établir un devis et assurer le suivi commercial et après-vente. Elles ne sont ni vendues ni cédées à des tiers.</p>
      <h2>Durée de conservation</h2>
      <p>Les demandes sont conservées 3 ans à compter du dernier contact, puis supprimées.</p>
      <h2>Cookies</h2>
      <p>Ce site n'utilise aucun cookie publicitaire ni de mesure d'audience tiers. Seul un cookie technique est utilisé pour l'espace d'administration.</p>
      <h2>Vos droits</h2>
      <p>Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement et d'opposition. Écrivez-nous à <a href={`mailto:${c.email}`}>{c.email}</a>. Vous pouvez également saisir la CNIL (www.cnil.fr).</p>
    </LegalPage>
  );
}
