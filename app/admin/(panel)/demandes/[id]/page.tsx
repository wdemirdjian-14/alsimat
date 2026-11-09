import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Mail, Paperclip, Phone, UserRound } from "lucide-react";
import { DeleteButton, SubmitButton } from "@/components/admin/form-parts";
import { MobileActionBar, ReplyComposer, StatusPills } from "@/components/admin/inquiry-client";
import { Badge, Card, Notice, TextArea } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { deadline } from "@/lib/inquiry-deadline";
import { INQUIRY_STATUS, INQUIRY_TYPES } from "@/lib/inquiry-labels";
import { getCompany } from "@/lib/settings";
import { deleteInquiry, updateInquiry } from "../../../actions/content";
import { replyToInquiry } from "../../../actions/inquiries";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string }> };

export default async function InquiryPage({ params, searchParams }: Props) {
  const { id } = await params;
  const q = await db.inquiry.findUnique({ where: { id } });
  if (!q) notFound();
  // Ouvrir une nouvelle demande la passe automatiquement « en cours ».
  if (q.status === "nouveau") q.status = (await db.inquiry.update({ where: { id }, data: { status: "en_cours" } })).status;
  const company = await getCompany();
  const open = q.status === "en_cours" || q.status === "nouveau";
  const due = open ? deadline(q.createdAt) : null;
  const what = q.vehicleRef ?? q.subject ?? "votre projet";
  const sign = `Bien cordialement,\n\nL'équipe ${company.name}\n${company.phone}`;
  const templates = [
    { label: "Prise de contact", subject: `Votre demande – ${what}`, body: `Bonjour {{prenom}},\n\nMerci pour votre demande concernant **${what}**. Je souhaiterais en échanger avec vous quelques minutes pour bien cerner votre besoin (usage, terrain, nombre de places, budget).\n\nQuand puis-je vous appeler ? Vous pouvez aussi me joindre au ${company.phone}.\n\n${sign}` },
    { label: "Envoi de devis", subject: `Votre devis Alsimat – ${what}`, body: `Bonjour {{prenom}},\n\nComme convenu, vous trouverez notre proposition pour **${what}**.\n\n- Livraison et mise en service partout en France\n- Garantie et SAV assurés par notre équipe\n\nJe reste à votre disposition pour toute question ou pour organiser un essai.\n\n${sign}` },
    { label: "Infos manquantes", subject: `Quelques précisions pour votre demande`, body: `Bonjour {{prenom}},\n\nMerci pour votre message. Pour vous faire une proposition adaptée, pourriez-vous me préciser :\n\n- l'usage prévu et le type de terrain\n- le nombre de places ou la charge utile souhaitée\n- vos délais\n\n${sign}` },
    ...(q.type === "sav" ? [{ label: "SAV", subject: `Votre demande SAV${q.serialNumber ? ` – n° ${q.serialNumber}` : ""}`, body: `Bonjour {{prenom}},\n\nNous avons bien reçu votre demande d'intervention. Notre technicien vous recontacte pour fixer un créneau.\n\nPour gagner du temps, pouvez-vous nous envoyer une photo ou une courte vidéo du problème en réponse à ce message ?\n\n${sign}` }] : []),
  ];
  const rows: [string, React.ReactNode][] = [
    ["Société", q.company],
    ["E-mail", <a key="m" href={`mailto:${q.email}`} className="break-all text-brand-600 underline">{q.email}</a>],
    ["Téléphone", q.phone && <a key="t" href={`tel:${q.phone}`} className="text-brand-600 underline">{q.phone}</a>],
    ["Code postal", q.postalCode],
    ["Véhicule", q.vehicleRef],
    ["N° de série", q.serialNumber],
    ["Objet", q.subject],
    ["Provenance", q.source],
    ["Reçue le", q.createdAt.toLocaleString("fr-FR")],
  ];
  return (
    <div className="pb-20 lg:pb-0">
      <Link href="/admin/demandes" className="mb-3 inline-block text-sm font-semibold text-brand-600">← Demandes</Link>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <h1 className="mr-2 w-full text-2xl font-extrabold sm:w-auto sm:text-3xl">{q.firstName} {q.lastName}</h1>
        <Badge tone={INQUIRY_TYPES[q.type]?.tone}>{INQUIRY_TYPES[q.type]?.label ?? q.type}</Badge>
        <Badge tone={INQUIRY_STATUS[q.status]?.tone}>{INQUIRY_STATUS[q.status]?.label ?? q.status}</Badge>
        {due && <Badge tone={due.tone}><Clock className="mr-1 inline h-3 w-3" />{due.label}</Badge>}
      </div>
      <Notice ok={(await searchParams).ok} />
      <div className="mb-6 hidden gap-3 lg:flex">
        {q.phone && <a href={`tel:${q.phone}`} className="btn-primary !py-2.5"><Phone className="h-4 w-4" /> Appeler</a>}
        <a href="#repondre" className="btn-dark !py-2.5"><Mail className="h-4 w-4" /> Répondre</a>
        {q.contactId && <Link href={`/admin/contacts/${q.contactId}`} className="btn-ghost !py-2.5 text-ink"><UserRound className="h-4 w-4" /> Fiche contact</Link>}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            {q.message && <p className="mb-6 rounded-xl bg-sand p-4 text-[15px] whitespace-pre-line">{q.message}</p>}
            <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-[140px_1fr] sm:gap-y-3">
              {rows.filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="contents"><dt className="text-xs text-ink/55 sm:text-sm">{k}</dt><dd className="mb-2 font-medium sm:mb-0">{v}</dd></div>
              ))}
            </dl>
            {q.files.length > 0 && (
              <ul className="mt-6 space-y-2">
                {q.files.map((f) => (
                  <li key={f}><a href={`/admin/fichiers/${f}`} target="_blank" className="flex items-center gap-2 text-sm font-medium text-brand-600 underline"><Paperclip className="h-4 w-4" /> {f.split("/").pop()}</a></li>
                ))}
              </ul>
            )}
            {q.contactId && <Link href={`/admin/contacts/${q.contactId}`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 lg:hidden"><UserRound className="h-4 w-4" /> Fiche contact (CRM)</Link>}
          </Card>
          <div id="repondre" className="scroll-mt-20">
            <Card title={`Répondre à ${q.firstName}`}>
              <ReplyComposer action={replyToInquiry.bind(null, q.id)} templates={templates} />
            </Card>
          </div>
        </div>
        <div className="space-y-4">
          <Card title="Statut"><StatusPills id={q.id} value={q.status} /></Card>
          <Card title="Notes internes">
            <form action={updateInquiry.bind(null, q.id)} className="space-y-4">
              <TextArea label="Visibles uniquement par l'équipe" name="notes" defaultValue={q.notes} rows={5} />
              <SubmitButton />
            </form>
          </Card>
          <DeleteButton action={deleteInquiry.bind(null, q.id)} label="Supprimer la demande" />
        </div>
      </div>
      <MobileActionBar id={q.id} phone={q.phone} status={q.status} />
    </div>
  );
}
