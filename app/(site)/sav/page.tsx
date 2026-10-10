import { Camera, ClipboardList, Hash, Wrench } from "lucide-react";
import { InquiryForm } from "@/components/site/inquiry-form";
import { PageHero } from "@/components/site/page-hero";
import { pageMetadata } from "@/lib/seo";
import { getCompany } from "@/lib/settings";
import { telHref } from "@/lib/site";

export const metadata = pageMetadata({
  title: "SAV golfette électrique – entretien et dépannage sur site",
  description: "Service après-vente Alsimat : entretien, diagnostic et réparation de votre golfette ou véhicule électrique directement sur site. Ouvrez votre demande SAV en ligne.",
  path: "/sav",
});

export default async function SavPage() {
  const company = await getCompany();
  const steps = [
    { icon: Hash, title: "Numéro de série", text: "Il figure sur la plaque constructeur du véhicule." },
    { icon: ClipboardList, title: "Description", text: "Décrivez le symptôme : quand, comment, depuis quand." },
    { icon: Camera, title: "Photos / vidéos", text: "Elles accélèrent le diagnostic à distance." },
    { icon: Wrench, title: "Intervention", text: "Notre technicien vous recontacte et intervient sur site." },
  ];
  return (
    <>
      <PageHero title="Service après-vente" subtitle="Entretien, diagnostic et réparation directement sur site. Ouvrez votre demande, nous vous recontactons rapidement." crumbs={[{ name: "SAV", href: "/sav" }]}>
        <a href={telHref(company.phone)} className="btn-light">Urgence : {company.phone}</a>
      </PageHero>
      <section className="container-x grid gap-10 py-14 lg:grid-cols-12 lg:py-20">
        <ol className="space-y-4 lg:col-span-4">
          {steps.map((s, i) => (
            <li key={s.title} data-reveal style={{ "--reveal-delay": `${i * 80}ms` } as React.CSSProperties} className="flex gap-4 rounded-3xl bg-sand p-6">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-500 text-white"><s.icon className="h-5 w-5" aria-hidden /></span>
              <div>
                <p className="font-bold">{i + 1}. {s.title}</p>
                <p className="mt-1 text-sm text-ink-soft">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="rounded-3xl border border-ink/10 bg-white p-6 shadow-xl shadow-ink/5 sm:p-10 lg:col-span-8">
          <h2 className="text-2xl font-bold">Ouvrir une demande SAV</h2>
          <p className="mt-2 mb-8 text-ink-soft">Les champs marqués d'un * sont obligatoires.</p>
          <InquiryForm type="sav" />
        </div>
      </section>
    </>
  );
}
