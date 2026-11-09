import Link from "next/link";
import { notFound } from "next/navigation";
import { Copy, Pause, Rocket } from "lucide-react";
import { DeleteButton, SubmitButton } from "@/components/admin/form-parts";
import { ImageInput } from "@/components/admin/image-input";
import { Badge, Card, Field, Notice, PageTitle, TextArea } from "@/components/admin/ui";
import { audienceWhere, SEGMENTS, STATUSES, type Audience } from "@/lib/crm";
import { db } from "@/lib/db";
import { deleteCampaign, duplicateCampaign, launchCampaign, pauseCampaign, saveCampaign, sendTest } from "../../../actions/campaigns";
import { CAMPAIGN_STATUS } from "@/lib/campaign-labels";
import { CAMPAIGN_TEMPLATES } from "@/lib/campaign-templates";
import { TestSend } from "./test-send";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; modele?: string; err?: string }> };

const TEMPLATE = `Bonjour {{prenom}},

Je me permets de vous contacter car **{{societe}}** pourrait gagner du temps avec une golfette électrique adaptée à vos déplacements sur site.

## Nos modèles du moment
- **Link 2 Cargo** : 2 places + benne 250 kg, dès 9 300 € HT
- **Street 2 Cargo** : utilitaire homologué route, cabine fermée

Livraison, prise en main et SAV sur site partout en France.

Seriez-vous disponible 10 minutes cette semaine pour en parler ?

Bien cordialement,
L'équipe Alsimat`;

export default async function CampaignPage({ params, searchParams }: Props) {
  const { id } = await params;
  const isNew = id === "nouveau";
  const c = isNew ? null : await db.campaign.findUnique({ where: { id } });
  if (!isNew && !c) notFound();
  const sp = await searchParams;
  const tpl = !c ? CAMPAIGN_TEMPLATES.find((t) => t.key === sp.modele) : undefined;
  const audience = (c?.audience ?? {}) as Audience;
  const hasFilter = !!(audience.lists?.length || audience.segments?.length || audience.statuses?.length || audience.tags?.length);
  const editable = !c || ["brouillon", "pause", "programmee"].includes(c.status);
  const [reach, tags, stats, lists] = await Promise.all([
    db.contact.count({ where: audienceWhere(audience) }),
    db.$queryRaw<{ tag: string }[]>`SELECT DISTINCT unnest(tags) AS tag FROM "Contact" ORDER BY 1 LIMIT 60`,
    c ? db.campaignRecipient.groupBy({ by: ["status"], where: { campaignId: c.id }, _count: true }) : [],
    db.contactList.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { members: { where: { contact: { unsubscribed: false, bounced: false } } } } } } }),
  ]);
  const [opened, clicked, unsub] = c
    ? await Promise.all([
        db.campaignRecipient.count({ where: { campaignId: c.id, openedAt: { not: null } } }),
        db.campaignRecipient.count({ where: { campaignId: c.id, clickedAt: { not: null } } }),
        db.activity.count({ where: { type: "campagne", title: "Désinscription des e-mails", content: { contains: c.name } } }),
      ])
    : [0, 0, 0];
  const sentCount = stats.find((s) => s.status === "envoye")?._count ?? 0;
  const pending = stats.find((s) => s.status === "attente")?._count ?? 0;
  const failed = stats.find((s) => s.status === "echec")?._count ?? 0;
  const pct = (a: number) => (sentCount ? `${Math.round((a / sentCount) * 100)} %` : "—");

  return (
    <>
      <PageTitle title={c ? c.name : "Nouvelle campagne"} action={<Link href="/admin/campagnes" className="text-sm font-semibold text-brand-600">← Campagnes</Link>} />
      <Notice ok={sp.ok} />
      {sp.err === "audience" && <p className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">Choisissez au moins une liste de diffusion (ou un segment, statut, étiquette) puis enregistrez avant de lancer : par sécurité, une campagne ne part jamais vers « tous les contacts ».</p>}
      {c && (
        <div className="mb-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            ["Statut", <Badge key="s" tone={CAMPAIGN_STATUS[c.status]?.tone}>{CAMPAIGN_STATUS[c.status]?.label}</Badge>],
            ["Envoyés", `${sentCount}${pending ? ` (+${pending} en attente)` : ""}`],
            ["Ouvertures", `${opened} · ${pct(opened)}`],
            ["Clics", `${clicked} · ${pct(clicked)}`],
            ["Désinscriptions", unsub],
            ["Échecs", failed],
          ].map(([k, v]) => (
            <div key={k as string} className="rounded-2xl border border-ink/10 bg-white p-4"><p className="text-xs text-ink/55">{k}</p><div className="mt-1 font-display text-lg font-bold">{v}</div></div>
          ))}
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-5">
        <form action={saveCampaign.bind(null, c?.id ?? null)} className="space-y-6 lg:col-span-3">
          <fieldset disabled={!editable} className="space-y-6">
            <Card title="Message">
              <div className="grid gap-4">
                <Field label="Nom interne" name="name" defaultValue={c?.name ?? tpl?.name} required placeholder="Prospection campings – mars" />
                <Field label="Objet de l'e-mail" name="subject" defaultValue={c?.subject ?? tpl?.subject} required placeholder="{{prenom}}, une golfette électrique pour votre site ?" hint="Court, personnel, sans MAJUSCULES ni « GRATUIT !!! » (filtres anti-spam)." />
                <Field label="Texte d'aperçu" name="preheader" defaultValue={c?.preheader ?? tpl?.preheader} placeholder="Affiché après l'objet dans la boîte de réception" />
                <TextArea label="Message" name="body" defaultValue={c?.body ?? tpl?.body ?? TEMPLATE} rows={16} required hint="Champs : {{prenom}} {{nom}} {{societe}} {{ville}} · ## Intertitre · - liste · **gras** · [lien](/vehicules/link-2-cargo)" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Texte du bouton" name="ctaLabel" defaultValue={c?.ctaLabel ?? tpl?.ctaLabel ?? "Découvrir les modèles"} />
                  <Field label="Lien du bouton" name="ctaUrl" defaultValue={c?.ctaUrl ?? tpl?.ctaUrl ?? "/"} />
                </div>
                <div><span className="label">Image (facultatif)</span><ImageInput name="image" defaultValue={c?.image ? [c.image] : tpl?.image ? [tpl.image] : []} /></div>
              </div>
            </Card>
            <Card title={`Destinataires · ${hasFilter ? `${reach} contact(s) ciblé(s)` : "aucune liste choisie"}`}>
              <p className="mb-4 text-sm text-ink/55">Cochez une ou plusieurs listes (obligatoire pour lancer). Les désinscrits et adresses invalides sont toujours exclus. Enregistrez pour recalculer le nombre.</p>
              <div className="mb-5">
                <span className="label">Listes de diffusion</span>
                {lists.length ? (
                  <div className="grid gap-1 sm:grid-cols-2">
                    {lists.map((l) => (
                      <label key={l.id} className="flex items-center gap-2 rounded-xl border border-ink/10 px-3 py-2 text-sm">
                        <input type="checkbox" name="lists" value={l.id} defaultChecked={audience.lists?.includes(l.id)} className="accent-brand-500" />
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: l.color }} /> <span className="flex-1">{l.name}</span> <span className="text-xs text-ink/50">{l._count.members}</span>
                      </label>
                    ))}
                  </div>
                ) : <p className="text-sm text-ink/55">Aucune liste. <Link href="/admin/contacts/import" className="text-brand-600 underline">Importer un fichier</Link></p>}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <span className="label">Segments</span>
                  {SEGMENTS.map((s) => <label key={s.key} className="flex items-center gap-2 text-sm"><input type="checkbox" name="segments" value={s.key} defaultChecked={audience.segments?.includes(s.key)} className="accent-brand-500" /> {s.label}</label>)}
                </div>
                <div>
                  <span className="label">Statuts</span>
                  {STATUSES.map((s) => <label key={s.key} className="flex items-center gap-2 text-sm"><input type="checkbox" name="statuses" value={s.key} defaultChecked={audience.statuses?.includes(s.key)} className="accent-brand-500" /> {s.label}</label>)}
                </div>
                <Field label="Avec l'une des étiquettes" name="tags" defaultValue={audience.tags?.join(", ")} hint={tags.length ? `Existantes : ${tags.map((t) => t.tag).join(", ")}` : undefined} />
                <Field label="Sans les étiquettes" name="excludeTags" defaultValue={audience.excludeTags?.join(", ")} />
              </div>
            </Card>
            {editable && <SubmitButton />}
          </fieldset>
        </form>

        <div className="space-y-6 lg:col-span-2">
          {c && (
            <>
              <Card title="Aperçu">
                <iframe src={`/admin/campagnes/${c.id}/apercu`} title="Aperçu de l'e-mail" className="h-[34rem] w-full rounded-xl border border-ink/10 bg-white" />
              </Card>
              <Card title="1. Envoi test"><TestSend action={sendTest.bind(null, c.id)} /></Card>
              {editable && (
                <Card title="2. Lancement">
                  <form action={launchCampaign.bind(null, c.id)} className="space-y-3">
                    <label className="block"><span className="label">Programmer (facultatif)</span><input type="datetime-local" name="scheduledAt" className="field" /></label>
                    <p className="text-xs text-ink/55">Sans date : envoi immédiat, au rythme réglé dans Marketing & SEA (pour protéger votre réputation d'expéditeur).</p>
                    <button className="btn-primary !py-2.5" disabled={!hasFilter}><Rocket className="h-4 w-4" /> {hasFilter ? `Lancer pour ${reach} contact(s)` : "Choisissez d'abord une liste"}</button>
                    {hasFilter && reach > 0 && <p className="text-xs text-ink/55">Au rythme réglé, l'envoi complet prendra environ {Math.ceil(reach / 300)} jour(s) (plafond quotidien).</p>}
                  </form>
                </Card>
              )}
              {c.status === "envoi" && <form action={pauseCampaign.bind(null, c.id)}><button className="btn-ghost !py-2.5 text-ink"><Pause className="h-4 w-4" /> Mettre en pause</button></form>}
              <div className="flex flex-wrap gap-3">
                <form action={duplicateCampaign.bind(null, c.id)}><button className="btn-ghost !py-2.5 text-ink"><Copy className="h-4 w-4" /> Dupliquer</button></form>
                <DeleteButton action={deleteCampaign.bind(null, c.id)} />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
