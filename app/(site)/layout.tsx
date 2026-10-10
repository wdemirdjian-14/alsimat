import Link from "next/link";
import { FileText, Phone } from "lucide-react";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { JsonLd } from "@/components/site/json-ld";
import { RevealObserver } from "@/components/site/reveal";
import { getNav } from "@/lib/nav";
import { organizationJsonLd } from "@/lib/seo";
import { getCompany } from "@/lib/settings";
import { telHref } from "@/lib/site";

// Le contenu vient de la base et est modifiable à tout moment depuis l'admin.
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [{ categories, links }, company] = await Promise.all([getNav(), getCompany()]);
  return (
    <>
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2">
        Aller au contenu
      </a>
      <Header categories={categories} links={links} phone={company.phone} phoneHref={telHref(company.phone)} />
      <main id="contenu" className="pb-16 lg:pb-0">{children}</main>
      <Footer company={company} categories={categories} links={links} />

      {/* Barre d'action fixe sur mobile */}
      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t border-ink/5 bg-white/95 p-2 backdrop-blur lg:hidden">
        <a href={telHref(company.phone)} className="btn-ghost !py-2.5 text-ink">
          <Phone className="h-4 w-4" aria-hidden /> Appeler
        </a>
        <Link href="/contact" className="btn-primary !py-2.5">
          <FileText className="h-4 w-4" aria-hidden /> Devis gratuit
        </Link>
      </div>

      <RevealObserver />
      <JsonLd data={organizationJsonLd(company)} />
    </>
  );
}
