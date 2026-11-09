import Link from "next/link";
import { Mail, Paperclip } from "lucide-react";
import { MailComposer, type MailTemplate } from "@/components/admin/composers";
import { Card, PageTitle } from "@/components/admin/ui";
import { CAMPAIGN_TEMPLATES } from "@/lib/campaign-templates";
import { db } from "@/lib/db";
import { marketingConfigured } from "@/lib/mail";
import { getCompany } from "@/lib/settings";
import { sendSingleEmail } from "../../actions/emails";

export const metadata = { title: "E-mails" };

export default async function EmailsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const company = await getCompany();
  const sent = await db.activity.findMany({
    where: {
      type: "email",
      ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { contact: { email: { contains: q, mode: "insensitive" } } }, { contact: { company: { contains: q, mode: "insensitive" } } }] } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 60,
    include: { contact: { select: { id: true, email: true, firstName: true, lastName: true, company: true } } },
  });
  const templates: MailTemplate[] = [
    { label: "Message libre", subject: "", body: `Bonjour {{prenom}},\n\n\n\nBien cordialement,\n\nL'équipe ${company.name}\n${company.phone}` },
    { label: "Relance devis", subject: "Suite à notre proposition", body: `Bonjour {{prenom}},\n\nJe reviens vers vous au sujet de notre proposition. Avez-vous pu en prendre connaissance ? Je reste disponible pour en discuter, ajuster la configuration ou organiser un essai.\n\nBien cordialement,\n\nL'équipe ${company.name}\n${company.phone}` },
    ...CAMPAIGN_TEMPLATES.map((t) => ({ label: t.label, subject: t.subject, body: t.body })),
  ];
  return (
    <>
      <PageTitle title="E-mails" subtitle="Envoi individuel avec pièces jointes : chaque e-mail s'inscrit dans la fiche du contact (vue 360)."
        action={<Link href="/admin/campagnes" className="btn-ghost !py-2.5 text-ink"><Mail className="h-4 w-4" /> Campagnes</Link>} />
      {!marketingConfigured() && <p className="mb-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">Aucun serveur d'envoi configuré : les e-mails ne pourront pas partir.</p>}
      <div className="grid gap-6 lg:grid-cols-5">
        <Card title="Nouvel e-mail" className="min-w-0 lg:col-span-3">
          <p className="-mt-2 mb-4 text-xs text-ink/50">Si l'adresse n'existe pas encore dans le CRM, le contact est créé automatiquement.</p>
          <MailComposer action={sendSingleEmail} templates={templates} to />
        </Card>
        <Card title="Derniers e-mails envoyés" className="min-w-0 lg:col-span-2">
          <form className="mb-4"><input name="q" type="search" defaultValue={q} placeholder="Rechercher (objet, e-mail, société)…" className="field !py-2" /></form>
          {sent.length ? (
            <ul className="-mx-2 divide-y divide-ink/5">
              {sent.map((a) => (
                <li key={a.id}>
                  <Link href={`/admin/contacts/${a.contact.id}#historique`} className="block rounded-xl px-2 py-3 hover:bg-sand">
                    <span className="flex items-center gap-2 text-sm">
                      <span className="min-w-0 flex-1 truncate font-semibold">{[a.contact.firstName, a.contact.lastName].filter(Boolean).join(" ") || a.contact.email}</span>
                      <span className="shrink-0 text-xs text-ink/45">{a.createdAt.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
                    </span>
                    <span className="block truncate text-xs text-ink/60">{a.title.replace(/^E-mail( envoyé)? : /, "")}</span>
                    <span className="block truncate text-xs text-ink/40">
                      {a.contact.company ?? a.contact.email}{a.author ? ` · par ${a.author}` : ""}
                      {a.attachments.length > 0 && <> · <Paperclip className="inline h-3 w-3" /> {a.attachments.length}</>}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-ink/55">Aucun e-mail individuel envoyé{q ? " pour cette recherche" : ""}.</p>}
        </Card>
      </div>
    </>
  );
}
