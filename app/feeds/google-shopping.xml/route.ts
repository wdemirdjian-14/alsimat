import { feedItems, xmlEscape as x } from "@/lib/feeds";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

/**
 * Flux produits au format Google Merchant Center (RSS 2.0).
 * Compatible : Google Shopping (fiches gratuites), Meta (Facebook/Instagram Shops), Pinterest, Microsoft Bing.
 * Les prix sont exprimés TTC (obligation pour la France) ; le prix HT figure dans la description.
 */
export async function GET() {
  const items = await feedItems();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>Alsimat – golfettes et véhicules électriques</title>
<link>${SITE_URL}</link>
<description>Catalogue Alsimat</description>
${items
  .map(
    (i) => `<item>
<g:id>${x(i.id)}</g:id>
<g:title>${x(i.title)}</g:title>
<g:description>${x(`${i.description} Prix : ${new Intl.NumberFormat("fr-FR").format(i.priceHt)} € HT.`)}</g:description>
<g:link>${x(i.link)}</g:link>
<g:image_link>${x(i.image)}</g:image_link>
${i.extraImages.map((u) => `<g:additional_image_link>${x(u)}</g:additional_image_link>`).join("\n")}
<g:availability>${i.inStock ? "in_stock" : "preorder"}</g:availability>
<g:condition>new</g:condition>
<g:price>${i.priceTtc.toFixed(2)} EUR</g:price>
${i.saleTtc ? `<g:sale_price>${i.saleTtc.toFixed(2)} EUR</g:sale_price>${i.saleEnds ? `\n<g:sale_price_effective_date>${new Date().toISOString().slice(0, 10)}T00:00+01:00/${new Date(i.saleEnds).toISOString().slice(0, 10)}T23:59+01:00</g:sale_price_effective_date>` : ""}` : ""}
<g:brand>${x(i.brand)}</g:brand>
${i.mpn ? `<g:mpn>${x(i.mpn)}</g:mpn>` : "<g:identifier_exists>no</g:identifier_exists>"}
<g:product_type>${x(i.productType)}</g:product_type>
${i.color ? `<g:color>${x(i.color)}</g:color>` : ""}
${i.highlights.map((h) => `<g:product_highlight>${x(h)}</g:product_highlight>`).join("\n")}
</item>`,
  )
  .join("\n")}
</channel>
</rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
