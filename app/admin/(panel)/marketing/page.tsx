import { ExternalLink } from "lucide-react";
import { SubmitButton } from "@/components/admin/form-parts";
import { Badge, Card, Field, Notice, PageTitle } from "@/components/admin/ui";
import { UtmBuilder } from "@/components/admin/utm-builder";
import { db } from "@/lib/db";
import { feedItems } from "@/lib/feeds";
import { marketingConfigured } from "@/lib/mail";
import { getSetting } from "@/lib/settings";
import { SITE_URL } from "@/lib/site";
import { saveMarketing } from "../../actions/marketing";

export const metadata = { title: "Marketing & SEA" };

/** Regroupe les provenances en grandes familles lisibles. */
function family(source: string | null) {
  const s = (source ?? "").toLowerCase();
  if (!s || s.startsWith("accès direct")) return "Accès direct";
  if (s.includes("google ads") || /google \/ cpc/.test(s)) return "Google Ads";
  if (s.includes("facebook") || s.includes("instagram") || s.includes("meta")) return "Facebook / Instagram";
  if (s.includes("emailing") || s.includes("newsletter") || s.includes("/ email")) return "E-mailing";
  if (s.startsWith("recherche naturelle")) return "Google / Bing (naturel)";
  if (s.startsWith("lien depuis")) return "Sites partenaires / liens";
  if (s.includes("import")) return "Import de fichier";
  if (s.includes("saisie")) return "Saisie manuelle";
  return source!.split(" — ")[0];
}

export default async function MarketingPage({ searchParams }: { searchParams: Promise<{ ok?: string; d?: string }> }) {
  const sp = await searchParams;
  const days = Number(sp.d) || 30;
  const since = new Date(Date.now() - days * 86400_000);
  const [mk, inquiries, won, feed, vehicles, cats, emailStats] = await Promise.all([
    getSetting("marketing"),
    db.inquiry.findMany({ where: { createdAt: { gte: since } }, select: { source: true, type: true } }),
    db.contact.findMany({ where: { status: "gagne", updatedAt: { gte: since } }, select: { source: true, estimatedValue: true } }),
    feedItems(),
    db.vehicle.findMany({ where: { published: true, categories: { some: {} } }, select: { name: true, slug: true, price: true, images: true } }),
    db.category.findMany({ where: { published: true }, select: { name: true, slug: true } }),
    db.campaignRecipient.aggregate({ where: { sentAt: { gte: since } }, _count: { _all: true, openedAt: true, clickedAt: true } }),
  ]);
  const table = new Map<string, { leads: number; devis: number; won: number; value: number }>();
  for (const q of inquiries) {
    const f = family(q.source);
    const r = table.get(f) ?? { leads: 0, devis: 0, won: 0, value: 0 };
    r.leads++;
    if (q.type === "devis") r.devis++;
    table.set(f, r);
  }
  for (const c of won) {
    const f = family(c.source);
    const r = table.get(f) ?? { leads: 0, devis: 0, won: 0, value: 0 };
    r.won++;
    r.value += c.estimatedValue ?? 0;
    table.set(f, r);
  }
  const rows = [...table.entries()].sort((a, b) => b[1].leads - a[1].leads);
  const excluded = vehicles.filter((v) => !feed.some((f) => f.link.endsWith(`/vehicules/${v.slug}`)));
  const pages = [{ url: "/", label: "Accueil" }, ...cats.map((c) => ({ url: `/gammes/${c.slug}`, label: `Gamme · ${c.name}` })), ...vehicles.map((v) => ({ url: `/vehicules/${v.slug}`, label: `Véhicule · ${v.name.trim()}` })), { url: "/contact", label: "Contact / devis" }];
  const trackingOn = !!(mk.gtm || mk.ga4 || mk.ads || mk.metaPixel || process.env.GA4_ID || process.env.GOOGLE_ADS_ID || process.env.META_PIXEL_ID);

  return (
    <>
      <PageTitle title="Marketing & SEA" subtitle="Mesure, campagnes publicitaires, liens de campagne, envoi des e-mails." />
      <Notice ok={sp.ok} />

      <Card title={`Ce qui rapporte des contacts · ${days} derniers jours`} className="mb-8">
        <div className="mb-3 flex gap-2 text-sm">{[30, 90, 365].map((d) => <a key={d} href={`?d=${d}`} className={`rounded-full px-3 py-1 ${d === days ? "bg-ink text-white" : "bg-sand"}`}>{d} j</a>)}</div>
        {rows.length ? (
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-ink/55 uppercase"><tr><th className="p-2">Provenance</th><th className="p-2">Demandes</th><th className="p-2">dont devis</th><th className="p-2">Ventes gagnées</th><th className="p-2">Montant</th></tr></thead>
            <tbody className="divide-y divide-ink/5">
              {rows.map(([k, r]) => (
                <tr key={k}><td className="p-2 font-semibold">{k}</td><td className="p-2">{r.leads}</td><td className="p-2">{r.devis}</td><td className="p-2">{r.won}</td><td className="p-2">{r.value ? `${new Intl.NumberFormat("fr-FR").format(r.value)} € HT` : "—"}</td></tr>
              ))}
            </tbody>
          </table>
        ) : <p className="text-sm text-ink/55">Pas encore de demande sur la période.</p>}
        <p className="mt-4 text-xs text-ink/55">
          E-mailing sur la période : {emailStats._count._all} envoyés · {emailStats._count.openedAt} ouverts · {emailStats._count.clickedAt} clics.
          Coûts et clics publicitaires : dans Google Ads / Meta. Comparez-les avec les demandes et ventes ci-dessus pour calculer votre coût par devis.
        </p>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Mesure d'audience & publicité">
          <p className="mb-4 flex items-center gap-2 text-sm">État : {trackingOn ? <Badge tone="green">Actif (après accord du visiteur)</Badge> : <Badge>Inactif — aucun cookie</Badge>}</p>
          <form action={saveMarketing.bind(null, "/admin/marketing")} className="space-y-4">
            <Field label="Google Tag Manager (ID du conteneur)" name="gtm" defaultValue={mk.gtm} placeholder="GTM-XXXXXXX" hint="Facultatif. Si vous utilisez GTM, n'y ajoutez pas de balise GA4 en double avec le champ ci-dessous." />
            <Field label="Google Analytics 4 (ID de mesure)" name="ga4" defaultValue={mk.ga4} placeholder="G-XXXXXXXXXX" />
            <Field label="Google Ads (ID de conversion)" name="ads" defaultValue={mk.ads} placeholder="AW-123456789" />
            <Field label="Google Ads (libellé de la conversion « demande »)" name="adsLabel" defaultValue={mk.adsLabel} placeholder="AbCdEfGhIjK" />
            <Field label="Pixel Meta (Facebook / Instagram)" name="metaPixel" defaultValue={mk.metaPixel} placeholder="1234567890123456" />
            <SubmitButton />
          </form>
          <p className="mt-4 text-xs text-ink/55">Événements envoyés : demande de devis/contact/SAV (conversion), message Walau (conversion), clic sur le téléphone, téléchargement de fiche technique.</p>
        </Card>

        <Card title="Générateur de liens de campagne (UTM)">
          <UtmBuilder base={SITE_URL} pages={pages} />
        </Card>

        <Card title="Flux produits (Google Shopping, Meta, Pinterest, Bing)">
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-between gap-2"><span>Flux Google / Meta</span><a href="/feeds/google-shopping.xml" target="_blank" className="flex items-center gap-1 font-semibold text-brand-600">google-shopping.xml <ExternalLink className="h-3 w-3" /></a></li>
            <li className="flex items-center justify-between gap-2"><span>Catalogue CSV</span><a href="/feeds/catalogue.csv" target="_blank" className="flex items-center gap-1 font-semibold text-brand-600">catalogue.csv <ExternalLink className="h-3 w-3" /></a></li>
            <li><Badge tone="green">{feed.length} produits envoyés</Badge> {excluded.length > 0 && <Badge tone="amber">{excluded.length} exclus (sans prix ou sans photo)</Badge>}</li>
          </ul>
          {excluded.length > 0 && <p className="mt-2 text-xs text-ink/55">Exclus : {excluded.map((v) => v.name.trim()).join(", ")}</p>}
          <p className="mt-4 text-xs text-ink/55">À déclarer dans Google Merchant Center (Produits → Sources → URL) et Meta Commerce Manager (Catalogue → Flux planifié).</p>
        </Card>

        <Card title="Envoi des e-mails de prospection">
          <p className="mb-4 flex items-center gap-2 text-sm">Serveur d'envoi : {marketingConfigured() ? <Badge tone="green">Configuré</Badge> : <Badge tone="red">Non configuré</Badge>} {process.env.MARKETING_SMTP_HOST && <Badge tone="blue">{process.env.MARKETING_SMTP_HOST}</Badge>}</p>
          <form action={saveMarketing.bind(null, "/admin/marketing")} className="space-y-4">
            <Field label="Nom de l'expéditeur" name="senderName" defaultValue={mk.senderName} />
            <Field label="Adresse de réponse" name="replyTo" defaultValue={mk.replyTo} placeholder="commercial@alsimat.com" />
            <Field label="Adresse postale (obligatoire dans les e-mails de prospection)" name="postalAddress" defaultValue={mk.postalAddress} placeholder="Alsimat, 12 rue …, 45000 Orléans" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="E-mails par minute" name="perMinute" type="number" defaultValue={mk.perMinute} />
              <Field label="Plafond par jour" name="dailyLimit" type="number" defaultValue={mk.dailyLimit} />
            </div>
            <SubmitButton />
          </form>
          <p className="mt-4 text-xs text-ink/55">Conseil : utilisez un service d'envoi dédié (Brevo, gratuit jusqu'à 300 e-mails/jour) déclaré dans le .env du serveur (MARKETING_SMTP_*), et configurez SPF/DKIM chez IONOS. Commencez par 50 à 100 e-mails par jour puis augmentez progressivement.</p>
        </Card>
      </div>
    </>
  );
}
