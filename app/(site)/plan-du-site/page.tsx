import Link from "next/link";
import { LegalPage } from "@/components/site/legal-page";
import { getAllVehicles, getCategoryTree } from "@/lib/catalog";
import { getArticles } from "@/lib/content";
import { getNav } from "@/lib/nav";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Plan du site", description: "Toutes les pages du site Alsimat.", path: "/plan-du-site" });

export default async function SitemapPage() {
  const [tree, vehicles, { links, sections }] = await Promise.all([getCategoryTree(), getAllVehicles(), getNav()]);
  const articles = sections.conseils ? await getArticles() : [];
  return (
    <LegalPage title="Plan du site" path="/plan-du-site">
      <ul>
        <li><Link href="/">Accueil</Link></li>
        {links.map((l) => <li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}
      </ul>
      {tree.flatMap((c) => [c, ...c.children]).map((c) => (
        <section key={c.id}>
          <h2><Link href={`/gammes/${c.slug}`}>{c.name}</Link></h2>
          <ul>
            {vehicles.filter((v) => v.categories.some((x) => x.categoryId === c.id)).map((v) => (
              <li key={v.id}><Link href={`/vehicules/${v.slug}`}>{v.name}</Link></li>
            ))}
          </ul>
        </section>
      ))}
      {articles.length > 0 && (
        <>
          <h2>Conseils</h2>
          <ul>{articles.map((a) => <li key={a.id}><Link href={`/conseils/${a.slug}`}>{a.title}</Link></li>)}</ul>
        </>
      )}
    </LegalPage>
  );
}
