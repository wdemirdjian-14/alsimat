import { LegalPage } from "@/components/site/legal-page";
import { pageMetadata } from "@/lib/seo";
import { getCompany } from "@/lib/settings";
import { SITE_URL } from "@/lib/site";

export const metadata = pageMetadata({ title: "Mentions légales", description: "Mentions légales du site Alsimat.", path: "/mentions-legales" });

const ToFill = () => <em className="text-ink/40">à compléter dans l'admin</em>;

export default async function MentionsPage() {
  const c = await getCompany();
  const address = [c.street, [c.postalCode, c.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  return (
    <LegalPage title="Mentions légales" path="/mentions-legales">
      <h2>Éditeur du site</h2>
      <p>
        <strong>{c.legalName}</strong><br />
        Adresse : {address || <ToFill />}<br />
        SIRET : {c.siret || <ToFill />}<br />
        Téléphone : {c.phone} — E-mail : <a href={`mailto:${c.email}`}>{c.email}</a><br />
        Directeur de la publication : {c.director || <ToFill />}
      </p>
      <h2>Hébergement</h2>
      <p>IONOS SARL, 7 place de la Gare, BP 70109, 57201 Sarreguemines Cedex, France — www.ionos.fr</p>
      <h2>Propriété intellectuelle</h2>
      <p>L'ensemble des contenus de {SITE_URL.replace(/^https?:\/\//, "")} (textes, photographies, logos) est protégé. Toute reproduction sans autorisation préalable est interdite.</p>
      <h2>Prix</h2>
      <p>Les prix indiqués sont exprimés hors taxes, pour des versions de base, à titre indicatif. Seul un devis signé engage les parties.</p>
    </LegalPage>
  );
}
