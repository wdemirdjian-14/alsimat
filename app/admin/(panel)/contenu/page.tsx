import { SubmitButton } from "@/components/admin/form-parts";
import { ImageInput } from "@/components/admin/image-input";
import { Card, Field, Notice, PageTitle, TextArea } from "@/components/admin/ui";
import { getSetting } from "@/lib/settings";
import { saveAbout, saveHome } from "../../actions/content";

export const metadata = { title: "Contenu des pages" };

export default async function ContentAdmin({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const [home, about] = await Promise.all([getSetting("home_content"), getSetting("about_content")]);
  return (
    <>
      <PageTitle title="Contenu des pages" subtitle="Textes de la page d'accueil et de la page À propos." />
      <Notice ok={(await searchParams).ok} />
      <form action={saveHome}>
        <Card title="Page d'accueil">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field className="sm:col-span-2" label="Sur-titre" name="heroEyebrow" defaultValue={home.heroEyebrow} />
            <Field label="Titre principal (H1)" name="heroTitle" defaultValue={home.heroTitle} hint="Gardez l'expression « golfette électrique » : c'est le mot-clé principal." />
            <Field label="Titre – partie colorée" name="heroHighlight" defaultValue={home.heroHighlight} />
            <TextArea className="sm:col-span-2" label="Texte d'introduction" name="heroSubtitle" defaultValue={home.heroSubtitle} rows={3} />
            <div className="sm:col-span-2"><span className="label">Image du bandeau</span><ImageInput name="heroImage" defaultValue={[home.heroImage]} hint="Format paysage, 2000 px de large idéalement." /></div>
            <Field label="Titre section gammes" name="gammesTitle" defaultValue={home.gammesTitle} />
            <Field label="Sous-titre section gammes" name="gammesSubtitle" defaultValue={home.gammesSubtitle} />
            <Field label="Titre appel à l'action" name="ctaTitle" defaultValue={home.ctaTitle} />
            <Field label="Texte appel à l'action" name="ctaSubtitle" defaultValue={home.ctaSubtitle} />
          </div>
          <div className="mt-5"><SubmitButton /></div>
        </Card>
      </form>
      <form action={saveAbout} id="a-propos" className="mt-8">
        <Card title="Page À propos">
          <div className="grid gap-4">
            <Field label="Titre" name="title" defaultValue={about.title} />
            <TextArea label="Introduction" name="intro" defaultValue={about.intro} rows={3} />
            <TextArea label="Texte" name="body" defaultValue={about.body} rows={10} hint="Un paragraphe par ligne vide. Présentez l'entreprise, son histoire, son équipe, sa zone d'intervention." />
            <div><span className="label">Image du bandeau</span><ImageInput name="image" defaultValue={about.image ? [about.image] : []} /></div>
            <div>
              <span className="label">Chiffres clés</span>
              <div className="grid gap-3 sm:grid-cols-2">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-2">
                    <input name={`stat${i}v`} defaultValue={about.stats[i]?.value} placeholder="Valeur" className="field w-28" />
                    <input name={`stat${i}l`} defaultValue={about.stats[i]?.label} placeholder="Libellé" className="field" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-5"><SubmitButton /></div>
        </Card>
      </form>
    </>
  );
}
