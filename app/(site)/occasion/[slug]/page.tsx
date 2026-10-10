import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { Gallery } from "@/components/site/gallery";
import { InquiryForm } from "@/components/site/inquiry-form";
import { JsonLd } from "@/components/site/json-ld";
import { getUsedVehicle } from "@/lib/content";
import { getSections } from "@/lib/nav";
import { pageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { formatPrice, paragraphs, parsePrice } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const v = await getUsedVehicle((await params).slug);
  if (!v) return {};
  return pageMetadata({
    title: `${v.name} d'occasion${v.year ? ` (${v.year})` : ""}`,
    description: `${v.name} d'occasion${v.price ? ` à ${formatPrice(v.price)}` : ""}. ${v.description ?? ""}`,
    path: `/occasion/${v.slug}`,
    image: v.images[0],
  });
}

export default async function UsedVehiclePage({ params }: Props) {
  if (!(await getSections()).occasion) notFound();
  const v = await getUsedVehicle((await params).slug);
  if (!v) notFound();
  const specs = { Année: v.year, "Heures / km": v.mileage, État: v.condition, ...(v.characteristics as Record<string, string>) };
  const price = parsePrice(v.price);
  return (
    <div className="bg-sand pt-28 lg:pt-36">
      <div className="container-x">
        <Breadcrumbs items={[{ name: "Occasion", href: "/occasion" }, { name: v.name, href: `/occasion/${v.slug}` }]} />
      </div>
      <section className="container-x grid gap-10 pt-6 pb-16 lg:grid-cols-12">
        <div className="lg:col-span-7"><Gallery images={v.images} alt={`${v.name} d'occasion`} /></div>
        <div className="lg:col-span-5">
          {v.sold && <span className="rounded-full bg-ink px-3 py-1 text-xs font-bold text-white">Vendu</span>}
          <h1 className="mt-3 text-4xl font-extrabold">{v.name} <span className="block text-lg font-semibold text-brand-600">Occasion</span></h1>
          <p className="mt-4 font-display text-3xl font-extrabold">{formatPrice(v.price)}</p>
          <table className="mt-6 w-full rounded-2xl bg-white text-sm">
            <tbody className="divide-y divide-ink/5">
              {Object.entries(specs).filter(([, val]) => val).map(([k, val]) => (
                <tr key={k}><th scope="row" className="px-4 py-3 text-left font-medium text-ink/55">{k}</th><td className="px-4 py-3 text-right font-semibold">{val}</td></tr>
              ))}
            </tbody>
          </table>
          <div className="prose-alsimat mt-6">{paragraphs(v.description).map((p, i) => <p key={i}>{p}</p>)}</div>
        </div>
      </section>
      {!v.sold && (
        <section id="devis" className="bg-white py-16">
          <div className="container-x max-w-3xl">
            <h2 className="section-title !text-3xl">Ce véhicule vous intéresse ?</h2>
            <div className="mt-8"><InquiryForm type="devis" vehicleRef={`Occasion : ${v.name}`} compact /></div>
          </div>
        </section>
      )}
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "Product", name: `${v.name} (occasion)`, image: v.images.map((i) => SITE_URL + i),
        ...(price ? { offers: { "@type": "Offer", price, priceCurrency: "EUR", itemCondition: "https://schema.org/UsedCondition",
          availability: v.sold ? "https://schema.org/SoldOut" : "https://schema.org/InStock" } } : {}),
      }} />
    </div>
  );
}
