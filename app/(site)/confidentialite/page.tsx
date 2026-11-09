import { LegalPage } from "@/components/site/legal-page";
import { pageMetadata } from "@/lib/seo";
import { getCompany, getSetting } from "@/lib/settings";

export const metadata = pageMetadata({ title: "Politique de confidentialité", description: "Comment Alsimat traite vos données personnelles.", path: "/confidentialite" });

export default async function PrivacyPage() {
  const [c, mk] = await Promise.all([getCompany(), getSetting("marketing")]);
  return (
    <LegalPage title="Politique de confidentialité" path="/confidentialite">
      <h2>Données collectées</h2>
      <p>Lorsque vous utilisez nos formulaires (devis, contact, SAV), nous collectons les informations que vous saisissez : nom, prénom, coordonnées, société, message et, pour le SAV, le numéro de série et les fichiers joints.</p>
      <h2>Finalités</h2>
      <p>Ces données servent uniquement à répondre à votre demande, établir un devis et assurer le suivi commercial et après-vente. Elles ne sont ni vendues ni cédées à des tiers.</p>
      <h2>Durée de conservation</h2>
      <p>Les demandes sont conservées 3 ans à compter du dernier contact, puis supprimées.</p>
      <h2>Cookies</h2>
      {mk.ga4 || mk.ads || mk.metaPixel || process.env.GA4_ID || process.env.GOOGLE_ADS_ID || process.env.META_PIXEL_ID ? (
        <p>Avec votre accord uniquement (bandeau affiché lors de votre première visite, modifiable via le lien « Cookies » en bas de page), nous utilisons des outils de mesure d'audience et de publicité : {[(mk.ga4 || process.env.GA4_ID) && "Google Analytics", (mk.ads || process.env.GOOGLE_ADS_ID) && "Google Ads", (mk.metaPixel || process.env.META_PIXEL_ID) && "Meta (Facebook / Instagram)"].filter(Boolean).join(", ")}. Si vous refusez, aucun de ces outils n'est chargé. La provenance de votre visite (campagne, site d'origine) est conservée 30 jours dans votre navigateur pour être jointe à vos demandes.</p>
      ) : (
        <p>Ce site n'utilise aucun cookie publicitaire ni de mesure d'audience tiers. Seul un cookie technique est utilisé pour l'espace d'administration.</p>
      )}
      <h2>Vos droits</h2>
      <p>Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement et d'opposition. Écrivez-nous à <a href={`mailto:${c.email}`}>{c.email}</a>. Vous pouvez également saisir la CNIL (www.cnil.fr).</p>
    </LegalPage>
  );
}
