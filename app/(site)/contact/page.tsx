import { Clock, Mail, MapPin, Phone, Wrench } from "lucide-react";
import Link from "next/link";
import { InquiryForm } from "@/components/site/inquiry-form";
import { PageHero } from "@/components/site/page-hero";
import { getAllVehicles } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";
import { getCompany } from "@/lib/settings";
import { telHref } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Contact & devis gratuit golfette électrique",
  description: "Demandez votre devis gratuit pour une golfette ou un véhicule électrique Alsimat, ou posez-nous vos questions. Réponse rapide par nos conseillers.",
  path: "/contact",
});

export default async function ContactPage() {
  const [company, vehicles] = await Promise.all([getCompany(), getAllVehicles()]);
  const address = [company.street, [company.postalCode, company.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  const items = [
    { icon: Phone, label: "Téléphone", value: company.phone, href: telHref(company.phone) },
    { icon: Mail, label: "E-mail", value: company.email, href: `mailto:${company.email}` },
    { icon: MapPin, label: address ? "Adresse" : "Zone d'intervention", value: address || company.serviceArea },
    { icon: Clock, label: "Horaires", value: company.hours },
  ];
  return (
    <>
      <PageHero title="Contact & devis" subtitle="Un projet, une question ? Décrivez-nous votre besoin : nous vous recommandons le bon modèle et vous envoyons un devis gratuit." crumbs={[{ name: "Contact", href: "/contact" }]} />
      <section className="container-x grid gap-10 py-14 lg:grid-cols-12 lg:py-20">
        <div className="rounded-3xl border border-ink/10 bg-white p-6 shadow-xl shadow-ink/5 sm:p-10 lg:col-span-8">
          <h2 className="text-2xl font-bold">Envoyez-nous votre demande</h2>
          <p className="mt-2 mb-8 text-ink-soft">Les champs marqués d'un * sont obligatoires.</p>
          <InquiryForm type="contact" vehicleOptions={vehicles.filter((v) => v.categories.length).map((v) => v.name.trim())} />
        </div>
        <aside className="space-y-4 lg:col-span-4">
          {items.map((it) => (
            <div key={it.label} data-reveal className="flex gap-4 rounded-3xl bg-sand p-6">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-brand-500"><it.icon className="h-5 w-5" aria-hidden /></span>
              <div>
                <p className="text-sm text-ink/55">{it.label}</p>
                {it.href ? <a href={it.href} className="font-semibold hover:text-brand-600">{it.value}</a> : <p className="font-semibold">{it.value}</p>}
              </div>
            </div>
          ))}
          <div data-reveal className="rounded-3xl bg-ink p-6 text-white">
            <Wrench className="h-6 w-6 text-brand-300" aria-hidden />
            <p className="mt-3 text-lg font-bold">Besoin du service après-vente ?</p>
            <p className="mt-1 text-sm text-white/70">Utilisez notre formulaire dédié pour un traitement plus rapide.</p>
            <Link href="/sav" className="btn-primary mt-5">Formulaire SAV</Link>
          </div>
        </aside>
      </section>
    </>
  );
}
