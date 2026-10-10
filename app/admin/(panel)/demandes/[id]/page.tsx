import Link from "next/link";
import { notFound } from "next/navigation";
import { Paperclip } from "lucide-react";
import { DeleteButton, SubmitButton } from "@/components/admin/form-parts";
import { Badge, Card, Notice, PageTitle, Select, TextArea } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { INQUIRY_STATUS, INQUIRY_TYPES } from "@/lib/inquiry-labels";
import { deleteInquiry, updateInquiry } from "../../../actions/content";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string }> };

export default async function InquiryPage({ params, searchParams }: Props) {
  const { id } = await params;
  const q = await db.inquiry.findUnique({ where: { id } });
  if (!q) notFound();
  // Ouvrir une nouvelle demande la passe automatiquement « en cours ».
  if (q.status === "nouveau") q.status = (await db.inquiry.update({ where: { id }, data: { status: "en_cours" } })).status;
  const rows: [string, React.ReactNode][] = [
    ["Nom", `${q.firstName} ${q.lastName}`],
    ["Société", q.company],
    ["E-mail", <a key="m" href={`mailto:${q.email}`} className="text-brand-600 underline">{q.email}</a>],
    ["Téléphone", q.phone && <a key="t" href={`tel:${q.phone}`} className="text-brand-600 underline">{q.phone}</a>],
    ["Code postal", q.postalCode],
    ["Véhicule", q.vehicleRef],
    ["N° de série", q.serialNumber],
    ["Objet", q.subject],
    ["Reçue le", q.createdAt.toLocaleString("fr-FR")],
  ];
  return (
    <>
      <PageTitle
        title={`${INQUIRY_TYPES[q.type]?.label ?? q.type} – ${q.firstName} ${q.lastName}`}
        action={<Link href="/admin/demandes" className="text-sm font-semibold text-brand-600">← Toutes les demandes</Link>}
      />
      <Notice ok={(await searchParams).ok} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[160px_1fr]">
            {rows.filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="contents"><dt className="text-ink/55">{k}</dt><dd className="font-medium">{v}</dd></div>
            ))}
          </dl>
          {q.message && <p className="mt-6 rounded-xl bg-sand p-4 text-sm whitespace-pre-line">{q.message}</p>}
          {q.files.length > 0 && (
            <ul className="mt-6 space-y-2">
              {q.files.map((f) => (
                <li key={f}><a href={`/admin/fichiers/${f}`} target="_blank" className="flex items-center gap-2 text-sm font-medium text-brand-600 underline"><Paperclip className="h-4 w-4" /> {f.split("/").pop()}</a></li>
              ))}
            </ul>
          )}
        </Card>
        <div className="space-y-4">
          <Card title="Suivi">
            <p className="mb-4"><Badge tone={INQUIRY_STATUS[q.status]?.tone}>{INQUIRY_STATUS[q.status]?.label}</Badge></p>
            <form action={updateInquiry.bind(null, q.id)} className="space-y-4">
              <Select label="Statut" name="status" defaultValue={q.status} options={Object.entries(INQUIRY_STATUS).map(([value, v]) => ({ value, label: v.label }))} />
              <TextArea label="Notes internes" name="notes" defaultValue={q.notes} rows={5} />
              <SubmitButton />
            </form>
          </Card>
          <DeleteButton action={deleteInquiry.bind(null, q.id)} label="Supprimer la demande" />
        </div>
      </div>
    </>
  );
}
