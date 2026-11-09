import Link from "next/link";
import type { Metadata } from "next";
import { ExternalLink, Trash2 } from "lucide-react";
import { generateMetadata as categoryMeta } from "@/app/(site)/gammes/[slug]/page";
import { generateMetadata as articleMeta } from "@/app/(site)/conseils/[slug]/page";
import { generateMetadata as vehicleMeta } from "@/app/(site)/vehicules/[slug]/page";
import { SubmitButton } from "@/components/admin/form-parts";
import { Badge, Card, Field, Notice, PageTitle, Toggle } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";
import { addRedirect, deleteRedirect, saveMarketing } from "../../actions/marketing";

export const metadata = { title: "SEO" };

type Row = { type: string; name: string; url: string; edit: string; title: string; desc: string; words: number; images: number; custom: boolean };

const titleOf = (m: Metadata) => {
  const t = m.title;
  if (!t) return "";
  if (typeof t === "string") return `${t} | Alsimat`;
  return "absolute" in t ? String(t.absolute) : "";
};
const words = (s?: string | null) => (s ?? "").split(/\s+/).filter(Boolean).length;

function check(r: Row) {
  const issues: { level: "bad" | "warn"; text: string }[] = [];
  const tl = r.title.length, dl = r.desc.length;
  if (tl > 70) issues.push({ level: "bad", text: `Titre trop long (${tl})` });
  else if (tl > 62) issues.push({ level: "warn", text: `Titre un peu long (${tl})` });
  else if (tl < 30) issues.push({ level: "warn", text: `Titre court (${tl})` });
  if (dl < 70) issues.push({ level: "bad", text: `Description courte (${dl})` });
  if (r.type === "Véhicule" && r.words < 120) issues.push({ level: "warn", text: `Texte court (${r.words} mots)` });
  if (r.type === "Gamme" && r.words < 150) issues.push({ level: "warn", text: `Texte de gamme à enrichir (${r.words} mots)` });
  if (r.type !== "Article" && r.images < 1) issues.push({ level: "bad", text: "Aucune image" });
  if (r.type === "Véhicule" && r.images < 3) issues.push({ level: "warn", text: `${r.images} photo(s) seulement` });
  return issues;
}

export default async function SeoPage({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string; f?: string }> }) {
  const sp = await searchParams;
  const [mk, vehicles, cats, articles, redirects] = await Promise.all([
    getSetting("marketing"),
    db.vehicle.findMany({ where: { published: true, categories: { some: {} } }, orderBy: { name: "asc" } }),
    db.category.findMany({ where: { published: true }, orderBy: { order: "asc" } }),
    db.article.findMany({ where: { published: true }, orderBy: { publishedAt: "desc" } }),
    db.redirect.findMany({ orderBy: { createdAt: "desc" } }),
  ]);
  const p = <T,>(slug: string) => ({ params: Promise.resolve({ slug }) }) as T;
  const rows: Row[] = [
    ...(await Promise.all(vehicles.map(async (v) => {
      const m = await vehicleMeta(p(v.slug));
      return { type: "Véhicule", name: v.name.trim(), url: `/vehicules/${v.slug}`, edit: `/admin/vehicules/${v.id}`, title: titleOf(m), desc: String(m.description ?? ""), words: words(v.description), images: v.images.length, custom: !!(v.seoTitle || v.seoDescription) };
    }))),
    ...(await Promise.all(cats.map(async (c) => {
      const m = await categoryMeta(p(c.slug));
      return { type: "Gamme", name: c.name, url: `/gammes/${c.slug}`, edit: `/admin/gammes/${c.id}`, title: titleOf(m), desc: String(m.description ?? ""), words: words(c.description) + words(c.intro), images: c.image ? 1 : 0, custom: !!(c.seoTitle || c.seoDescription) };
    }))),
    ...(await Promise.all(articles.map(async (a) => {
      const m = await articleMeta(p(a.slug));
      return { type: "Article", name: a.title, url: `/conseils/${a.slug}`, edit: `/admin/conseils/${a.id}`, title: titleOf(m), desc: String(m.description ?? ""), words: words(a.content), images: a.image ? 1 : 0, custom: !!(a.seoTitle || a.seoDescription) };
    }))),
  ];
  const audited = rows.map((r) => ({ ...r, issues: check(r) }));
  const shown = sp.f === "issues" ? audited.filter((r) => r.issues.length) : audited;
  const ok = audited.filter((r) => !r.issues.length).length;
  const score = Math.round((audited.reduce((s, r) => s + Math.max(0, 100 - r.issues.reduce((x, i) => x + (i.level === "bad" ? 35 : 12), 0)), 0) / Math.max(1, audited.length)));

  return (
    <>
      <PageTitle title="SEO" subtitle="Référencement naturel : audit des pages, redirections, outils Google et Bing." />
      <Notice ok={sp.ok} />
      {sp.err && <p className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">Redirection invalide.</p>}

      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-ink/10 bg-white p-5"><p className="text-xs text-ink/55">Score SEO moyen</p><p className={cn("font-display text-4xl font-extrabold", score >= 80 ? "text-brand-600" : score >= 60 ? "text-amber-600" : "text-red-600")}>{score}/100</p></div>
        <div className="rounded-2xl border border-ink/10 bg-white p-5"><p className="text-xs text-ink/55">Pages auditées</p><p className="font-display text-4xl font-extrabold">{audited.length}</p></div>
        <div className="rounded-2xl border border-ink/10 bg-white p-5"><p className="text-xs text-ink/55">Sans problème</p><p className="font-display text-4xl font-extrabold">{ok}</p></div>
        <div className="rounded-2xl border border-ink/10 bg-white p-5 text-sm">
          <p className="text-xs text-ink/55">Fichiers pour les moteurs</p>
          {["/sitemap.xml", "/robots.txt", "/llms.txt"].map((u) => <a key={u} href={u} target="_blank" className="flex items-center gap-1 font-semibold text-brand-600">{u} <ExternalLink className="h-3 w-3" /></a>)}
        </div>
      </div>

      <Card title="Audit des pages" className="mb-8">
        <div className="mb-3 flex gap-2 text-sm">
          <Link href="/admin/seo" className={cn("rounded-full px-3 py-1", !sp.f && "bg-ink text-white")}>Toutes</Link>
          <Link href="/admin/seo?f=issues" className={cn("rounded-full px-3 py-1", sp.f === "issues" && "bg-ink text-white")}>À améliorer ({audited.length - ok})</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-ink/55 uppercase"><tr><th className="p-2">Page</th><th className="p-2">Titre Google / description</th><th className="p-2">À corriger</th></tr></thead>
            <tbody className="divide-y divide-ink/5">
              {shown.map((r) => (
                <tr key={r.url} className="align-top">
                  <td className="p-2"><Badge>{r.type}</Badge><Link href={r.edit} className="mt-1 block font-semibold hover:text-brand-600">{r.name}</Link>{r.custom && <span className="text-xs text-brand-700">SEO personnalisé</span>}</td>
                  <td className="max-w-xl p-2">
                    <p className="font-medium text-[#1a0dab]">{r.title}</p>
                    <p className="text-xs text-[#006621]">{SITE_URL.replace(/^https?:\/\//, "")}{r.url}</p>
                    <p className="text-xs text-ink/60">{r.desc}</p>
                  </td>
                  <td className="p-2">
                    {r.issues.length ? (
                      <ul className="space-y-1">{r.issues.map((i) => <li key={i.text}><Badge tone={i.level === "bad" ? "red" : "amber"}>{i.text}</Badge></li>)}</ul>
                    ) : <Badge tone="green">OK</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-ink/55">Les titres et descriptions sont générés automatiquement à partir des données (nom, places, autonomie, prix). Pour les personnaliser, ouvrez la page concernée → « Référencement ».</p>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Outils pour webmasters">
          <form action={saveMarketing.bind(null, "/admin/seo")} className="space-y-4">
            <Field label="Code de validation Google Search Console" name="googleVerification" defaultValue={mk.googleVerification} hint="Méthode « Balise HTML » : collez la balise ou seulement le contenu (content=…)." />
            <Field label="Code de validation Bing Webmaster Tools" name="bingVerification" defaultValue={mk.bingVerification} />
            <input type="hidden" name="indexingForm" value="1" />
            <Toggle label="Autoriser l'indexation par les moteurs" name="indexing" defaultChecked={mk.indexing} hint="Décocher uniquement pour un site en préparation : le site disparaîtrait de Google." />
            <SubmitButton />
          </form>
          <ul className="mt-6 space-y-1 text-sm">
            <li><a className="text-brand-600 underline" href="https://search.google.com/search-console" target="_blank">Google Search Console</a> → Sitemaps → <code>{SITE_URL}/sitemap.xml</code></li>
            <li><a className="text-brand-600 underline" href="https://www.bing.com/webmasters" target="_blank">Bing Webmaster Tools</a> (import depuis Search Console)</li>
            <li><a className="text-brand-600 underline" href={`https://pagespeed.web.dev/analysis?url=${encodeURIComponent(SITE_URL)}`} target="_blank">Tester la vitesse (PageSpeed)</a></li>
            <li><a className="text-brand-600 underline" href={`https://search.google.com/test/rich-results?url=${encodeURIComponent(SITE_URL + "/vehicules/link-2-cargo")}`} target="_blank">Tester les résultats enrichis Google</a></li>
          </ul>
        </Card>
        <Card title="Redirections 301">
          <div id="redirections" />
          <form action={addRedirect} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <Field label="Ancienne adresse" name="from" placeholder="/ancienne-page" />
            <Field label="Nouvelle adresse" name="to" placeholder="/gammes/bus" />
            <SubmitButton label="Ajouter" />
          </form>
          <p className="mt-2 text-xs text-ink/55">À utiliser quand vous supprimez ou renommez une page déjà référencée : Google transfère son référencement vers la nouvelle.</p>
          <ul className="mt-4 divide-y divide-ink/5 text-sm">
            {redirects.map((r) => (
              <li key={r.id} className="flex items-center gap-2 py-2">
                <span className="min-w-0 flex-1 truncate"><code>{r.from}</code> → <code>{r.to}</code></span>
                <span className="text-xs text-ink/45">{r.hits} visite(s)</span>
                <form action={deleteRedirect.bind(null, r.id)}><button aria-label="Supprimer" className="text-red-600"><Trash2 className="h-4 w-4" /></button></form>
              </li>
            ))}
            {!redirects.length && <li className="py-2 text-ink/50">Aucune redirection personnalisée.</li>}
          </ul>
        </Card>
      </div>
    </>
  );
}
