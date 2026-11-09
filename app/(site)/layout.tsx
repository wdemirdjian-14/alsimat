import Link from "next/link";
import { FileText, Phone } from "lucide-react";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { JsonLd } from "@/components/site/json-ld";
import { RevealObserver } from "@/components/site/reveal";
import { Tracking, type TrackingConfig } from "@/components/site/tracking";
import { Walau } from "@/components/site/walau";
import { getNav } from "@/lib/nav";
import { organizationJsonLd } from "@/lib/seo";
import type { Metadata } from "next";
import { getCompany, getSetting } from "@/lib/settings";
import { telHref } from "@/lib/site";

// Le contenu vient de la base et est modifiable à tout moment depuis l'admin.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const mk = await getSetting("marketing");
  return {
    verification: {
      ...(mk.googleVerification ? { google: mk.googleVerification } : {}),
      ...(mk.bingVerification ? { other: { "msvalidate.01": mk.bingVerification } } : {}),
    },
    ...(!mk.indexing || process.env.ALLOW_INDEXING === "false" ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [{ categories, links }, company, mk] = await Promise.all([getNav(), getCompany(), getSetting("marketing")]);
  // Identifiants réglés dans l'admin (Marketing & SEA), à défaut dans le .env du serveur.
  const tracking: TrackingConfig = {
    ga4: mk.ga4 || process.env.GA4_ID || undefined,
    ads: mk.ads || process.env.GOOGLE_ADS_ID || undefined,
    adsLead: mk.adsLabel || process.env.GOOGLE_ADS_LEAD_LABEL || undefined,
    metaPixel: mk.metaPixel || process.env.META_PIXEL_ID || undefined,
  };
  const trackingOn = !!(tracking.ga4 || tracking.ads || tracking.metaPixel);
  return (
    <>
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2">
        Aller au contenu
      </a>
      <Header categories={categories} links={links} phone={company.phone} phoneHref={telHref(company.phone)} />
      <main id="contenu" className="pb-16 lg:pb-0">{children}</main>
      <Footer company={company} categories={categories} links={links} cookies={trackingOn} />

      {/* Barre d'action fixe sur mobile */}
      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t border-ink/5 bg-white/95 p-2 backdrop-blur lg:hidden">
        <a href={telHref(company.phone)} className="btn-ghost !py-2.5 text-ink">
          <Phone className="h-4 w-4" aria-hidden /> Appeler
        </a>
        <Link href="/contact" className="btn-primary !py-2.5">
          <FileText className="h-4 w-4" aria-hidden /> Devis gratuit
        </Link>
      </div>

      <Walau phone={company.phone} phoneHref={telHref(company.phone)} />
      <Tracking config={tracking} />
      <RevealObserver />
      <JsonLd data={organizationJsonLd(company)} />
    </>
  );
}
