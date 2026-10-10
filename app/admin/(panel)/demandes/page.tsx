import Link from "next/link";
import { Badge, Empty, Notice, PageTitle } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { INQUIRY_STATUS, INQUIRY_TYPES } from "@/lib/inquiry-labels";
import { cn } from "@/lib/utils";

export const metadata = { title: "Demandes" };

type Props = { searchParams: Promise<{ type?: string; status?: string; ok?: string }> };

export default async function InquiriesPage({ searchParams }: Props) {
  const { type, status, ok } = await searchParams;
  const list = await db.inquiry.findMany({
    where: { ...(type ? { type } : {}), ...(status ? { status } : { status: { not: "archive" } }) },
    orderBy: { createdAt: "desc" },
    take: 300,
  });
  const chip = (label: string, params: Record<string, string | undefined>, active: boolean) => {
    const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]).toString();
    return (
      <Link href={`/admin/demandes${q ? `?${q}` : ""}`} className={cn("rounded-full px-3 py-1.5 text-sm font-medium", active ? "bg-ink text-white" : "bg-white text-ink/70 hover:text-ink")}>
        {label}
      </Link>
    );
  };
  return (
    <>
      <PageTitle title="Demandes" subtitle="Devis, messages et tickets SAV reçus depuis le site." />
      <Notice ok={ok} />
      <div className="mb-3 flex flex-wrap gap-2">
        {chip("Toutes", { status }, !type)}
        {Object.entries(INQUIRY_TYPES).map(([k, v]) => chip(v.label, { type: k, status }, type === k))}
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {chip("Actives", { type }, !status)}
        {Object.entries(INQUIRY_STATUS).map(([k, v]) => chip(v.label, { type, status: k }, status === k))}
      </div>
      {list.length ? (
        <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-sand text-left text-xs text-ink/55 uppercase">
              <tr><th className="p-3">Date</th><th className="p-3">Type</th><th className="p-3">Contact</th><th className="p-3">Objet</th><th className="p-3">Statut</th></tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {list.map((q) => (
                <tr key={q.id} className={cn("hover:bg-sand/60", q.status === "nouveau" && "font-semibold")}>
                  <td className="p-3 whitespace-nowrap text-ink/60">{q.createdAt.toLocaleDateString("fr-FR")}</td>
                  <td className="p-3"><Badge tone={INQUIRY_TYPES[q.type]?.tone}>{INQUIRY_TYPES[q.type]?.label}</Badge></td>
                  <td className="p-3"><Link href={`/admin/demandes/${q.id}`} className="hover:text-brand-600">{q.firstName} {q.lastName}</Link><span className="block text-xs font-normal text-ink/50">{q.company ?? q.email}</span></td>
                  <td className="p-3 text-ink/70">{q.vehicleRef ?? q.subject ?? q.serialNumber ?? "—"}</td>
                  <td className="p-3"><Badge tone={INQUIRY_STATUS[q.status]?.tone}>{INQUIRY_STATUS[q.status]?.label ?? q.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>Aucune demande dans cette vue.</Empty>
      )}
    </>
  );
}
