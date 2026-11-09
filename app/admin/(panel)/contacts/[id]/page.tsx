import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, FileText, Inbox, Mail, MessageSquare, Phone, RefreshCw, StickyNote } from "lucide-react";
import { EmailComposer } from "@/components/admin/crm-client";
import { DeleteButton, SubmitButton } from "@/components/admin/form-parts";
import { Badge, Card, Field, Notice, PageTitle, Select, TextArea, Toggle } from "@/components/admin/ui";
import { CONSENTS, SEGMENTS, STATUS, STATUSES } from "@/lib/crm";
import { db } from "@/lib/db";
import { addActivity, deleteContact, saveContact, sendContactEmail } from "../../../actions/crm";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string }> };

const ICONS = { note: StickyNote, appel: Phone, email: Mail, demande: Inbox, campagne: MessageSquare, statut: RefreshCw, rdv: CalendarClock, devis: FileText } as const;

export default async function ContactPage({ params, searchParams }: Props) {
  const { id } = await params;
  const isNew = id === "nouveau";
  const c = isNew
    ? null
    : await db.contact.findUnique({
        where: { id },
        include: {
          activities: { orderBy: { createdAt: "desc" }, take: 100 },
          inquiries: { orderBy: { createdAt: "desc" } },
          recipients: { include: { campaign: true }, orderBy: { sentAt: "desc" }, take: 20 },
        },
      });
  if (!isNew && !c) notFound();
  const name = c ? [c.firstName, c.lastName].filter(Boolean).join(" ") || c.email : "Nouveau contact";

  return (
    <>
      <PageTitle title={name} subtitle={c ? `${c.company ?? ""}${c.company ? " · " : ""}${c.email}` : undefined}
        action={<Link href="/admin/contacts" className="text-sm font-semibold text-brand-600">← Contacts</Link>} />
      <Notice ok={(await searchParams).ok} />
      {c && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Badge tone={STATUS[c.status]?.tone}>{STATUS[c.status]?.label ?? c.status}</Badge>
          <Badge>{SEGMENTS.find((s) => s.key === c.segment)?.label ?? c.segment}</Badge>
          {c.unsubscribed && <Badge tone="red">Désinscrit des e-mails</Badge>}
          {c.bounced && <Badge tone="red">Adresse invalide</Badge>}
          {c.tags.map((t) => <Badge key={t} tone="blue">{t}</Badge>)}
          {c.phone && <a href={`tel:${c.phone}`} className="btn-ghost ml-auto !py-2 text-ink"><Phone className="h-4 w-4" /> {c.phone}</a>}
          <a href={`mailto:${c.email}`} className="btn-ghost !py-2 text-ink"><Mail className="h-4 w-4" /> E-mail</a>
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-5">
        <form action={saveContact.bind(null, c?.id ?? null)} className="space-y-6 lg:col-span-3">
          <Card title="Coordonnées">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Prénom" name="firstName" defaultValue={c?.firstName} />
              <Field label="Nom" name="lastName" defaultValue={c?.lastName} />
              <Field label="E-mail" name="email" type="email" defaultValue={c?.email} required />
              <Field label="Téléphone" name="phone" defaultValue={c?.phone} />
              <Field label="Société / établissement" name="company" defaultValue={c?.company} />
              <Field label="Fonction" name="jobTitle" defaultValue={c?.jobTitle} />
              <Field label="Code postal" name="postalCode" defaultValue={c?.postalCode} />
              <Field label="Ville" name="city" defaultValue={c?.city} />
            </div>
          </Card>
          <Card title="Suivi commercial">
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Statut" name="status" defaultValue={c?.status ?? "nouveau"} options={STATUSES.map((s) => ({ value: s.key, label: s.label }))} />
              <Select label="Segment" name="segment" defaultValue={c?.segment ?? "prospect"} options={SEGMENTS.map((s) => ({ value: s.key, label: s.label }))} />
              <Field label="Montant estimé (€ HT)" name="estimatedValue" type="number" defaultValue={c?.estimatedValue} />
              <Field label="Étiquettes (séparées par des virgules)" name="tags" defaultValue={c?.tags.join(", ")} placeholder="camping, salon-2026, loire" />
              <TextArea className="sm:col-span-2" label="Notes" name="notes" defaultValue={c?.notes} rows={4} />
            </div>
          </Card>
          <Card title="Origine & consentement (RGPD)">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Provenance" name="source" defaultValue={c?.source} placeholder="Salon, recommandation, fichier…" />
              <Select label="Base légale des e-mails" name="consent" defaultValue={c?.consent ?? "b2b"} options={CONSENTS.map((s) => ({ value: s.key, label: s.label }))} />
              <Field className="sm:col-span-2" label="Origine des données" name="originNote" defaultValue={c?.originNote} placeholder="Ex. carte de visite salon des maires 2026" />
              <div className="sm:col-span-2"><Toggle label="Ne plus envoyer d'e-mails de prospection" name="unsubscribed" defaultChecked={c?.unsubscribed} hint="Coché automatiquement quand le contact se désinscrit." /></div>
            </div>
          </Card>
          <SubmitButton />
        </form>

        <div className="space-y-6 lg:col-span-2">
          {c && (
            <>
              <Card title="Ajouter à l'historique">
                <form action={addActivity.bind(null, c.id)} className="space-y-3">
                  <select name="type" className="field !py-2.5" defaultValue="note">
                    <option value="note">Note</option><option value="appel">Appel</option><option value="rdv">Rendez-vous</option><option value="devis">Devis envoyé</option>
                  </select>
                  <textarea name="content" rows={3} className="field" placeholder="Compte rendu, prochaine étape…" required />
                  <SubmitButton label="Ajouter" />
                </form>
              </Card>
              <Card title="Envoyer un e-mail">
                <EmailComposer action={sendContactEmail.bind(null, c.id)} disabled={c.bounced ? "Adresse invalide : envoi désactivé." : undefined} />
              </Card>
              <Card title="Historique">
                <ol id="historique" className="space-y-4">
                  {c.activities.map((a) => {
                    const Icon = ICONS[a.type as keyof typeof ICONS] ?? StickyNote;
                    return (
                      <li key={a.id} className="flex gap-3">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600"><Icon className="h-4 w-4" /></span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">{a.title}</p>
                          <p className="text-xs text-ink/45">{a.createdAt.toLocaleString("fr-FR")}{a.author ? ` · ${a.author}` : ""}</p>
                          {a.content && <p className="mt-1 text-sm whitespace-pre-line text-ink/70">{a.content}</p>}
                        </div>
                      </li>
                    );
                  })}
                  {!c.activities.length && <li className="text-sm text-ink/50">Aucun échange pour le moment.</li>}
                </ol>
              </Card>
              {c.recipients.length > 0 && (
                <Card title="Campagnes reçues">
                  <ul className="space-y-2 text-sm">
                    {c.recipients.map((r) => (
                      <li key={r.id} className="flex justify-between gap-2">
                        <Link href={`/admin/campagnes/${r.campaignId}`} className="hover:text-brand-600">{r.campaign.name}</Link>
                        <span className="text-xs text-ink/55">{r.clickedAt ? "cliqué" : r.openedAt ? "ouvert" : r.status === "envoye" ? "envoyé" : r.status}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
              {c.inquiries.length > 0 && (
                <Card title="Demandes du site">
                  <ul className="space-y-2 text-sm">{c.inquiries.map((q) => <li key={q.id}><Link href={`/admin/demandes/${q.id}`} className="hover:text-brand-600">{q.type} · {q.vehicleRef ?? q.subject ?? "—"} · {q.createdAt.toLocaleDateString("fr-FR")}</Link></li>)}</ul>
                </Card>
              )}
              <DeleteButton action={deleteContact.bind(null, c.id)} label="Supprimer le contact" confirmText="Supprimer ce contact et tout son historique ?" />
            </>
          )}
        </div>
      </div>
    </>
  );
}
