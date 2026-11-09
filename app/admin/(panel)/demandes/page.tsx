import Link from "next/link";
import { Badge, Empty, Notice, PageTitle } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { INQUIRY_STATUS, INQUIRY_TYPES } from "@/lib/inquiry-labels";
import { deadline } from "@/lib/inquiry-deadline";
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
      <Link href={`/admin/demandes${q ? `?${q}` : ""}`} className={cn("shrink-0 rounded-full px-3 py-1.5 text-sm font-medium", active ? "bg-ink text-white" : "bg-white text-ink/70 hover:text-ink")}>
        {label}
      </Link>
    );
  };
  return (
    <>
      <PageTitle title="Demandes" subtitle="Devis, messages et tickets SAV reçus depuis le site." />
      <Notice ok={ok} />
      <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {chip("Toutes", { status }, !type)}
        {Object.entries(INQUIRY_TYPES).map(([k, v]) => chip(v.label, { type: k, status }, type === k))}
      </div>
      <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {chip("Actives", { type }, !status)}
        {Object.entries(INQUIRY_STATUS).map(([k, v]) => chip(v.label, { type, status: k }, status === k))}
      </div>
      {list.length > 0 && (
        <ul className="space-y-2 md:hidden">
          {list.map((q) => {
            const due = ["nouveau", "en_cours"].includes(q.status) ? deadline(q.createdAt) : null;
            return (
              <li key={q.id}>
                <Link href={`/admin/demandes/${q.id}`} className={cn("block rounded-2xl border bg-white p-4 active:bg-sand", q.status === "nouveau" ? "border-amber-300" : "border-ink/10")}>
                  <div className="flex items-center gap-2">
                    {q.status === "nouveau" && <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" aria-label="Nouvelle" />}
                    <span className={cn("flex-1 truncate", q.status === "nouveau" ? "font-bold" : "font-semibold")}>{q.firstName} {q.lastName}</span>
                    <span className="text-xs text-ink/45">{q.createdAt.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-ink/60">{q.vehicleRef ?? q.subject ?? q.company ?? q.email}</p>
                  {q.message && <p className="mt-1 line-clamp-2 text-xs text-ink/50">{q.message}</p>}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge tone={INQUIRY_TYPES[q.type]?.tone}>{INQUIRY_TYPES[q.type]?.label}</Badge>
                    <Badge tone={INQUIRY_STATUS[q.status]?.tone}>{INQUIRY_STATUS[q.status]?.label ?? q.status}</Badge>
                    {due && <Badge tone={due.tone}>{due.label}</Badge>}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      {list.length ? (
        <div className="hidden overflow-x-auto md:block rounded-2xl border border-ink/10 bg-white">
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
