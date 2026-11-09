import Link from "next/link";
import { CalendarClock, FileText, Inbox, Mail, MessageSquare, Paperclip, Phone, RefreshCw, StickyNote } from "lucide-react";
import { attachmentLabel } from "@/lib/uploads";
import { cn } from "@/lib/utils";

const ICONS = { note: StickyNote, appel: Phone, email: Mail, demande: Inbox, campagne: MessageSquare, statut: RefreshCw, rdv: CalendarClock, devis: FileText } as const;

/** Affiche le **gras** des messages (syntaxe des e-mails) sans interpréter de HTML. */
const rich = (t: string) => t.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part));

type Item = { id: string; type: string; title: string; content: string | null; author: string | null; attachments: string[]; createdAt: Date; inquiryId?: string | null };

/** Fil des échanges (notes internes en jaune, e-mails envoyés en vert), avec pièces jointes. */
export function Timeline({ items, linkInquiries, empty = "Aucun échange pour le moment." }: { items: Item[]; linkInquiries?: boolean; empty?: string }) {
  if (!items.length) return <p className="text-sm text-ink/50">{empty}</p>;
  return (
    <ol className="space-y-4">
      {items.map((a) => {
        const Icon = ICONS[a.type as keyof typeof ICONS] ?? StickyNote;
        const internal = a.type === "note";
        return (
          <li key={a.id} className="flex gap-3">
            <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full", internal ? "bg-amber-50 text-amber-600" : "bg-brand-50 text-brand-600")}><Icon className="h-4 w-4" /></span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{a.title}</p>
              <p className="text-xs text-ink/45">
                {a.createdAt.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}{a.author ? ` · ${a.author}` : ""}
                {linkInquiries && a.inquiryId && <> · <Link href={`/admin/demandes/${a.inquiryId}`} className="text-brand-600 underline">demande</Link></>}
              </p>
              {a.content && <p className={cn("mt-1 rounded-xl p-3 text-sm whitespace-pre-line break-words", internal ? "bg-amber-50/60" : "bg-sand")}>{a.content}</p>}
              {a.attachments.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-2">
                  {a.attachments.map((f) => (
                    <li key={f}>
                      <a href={`/admin/fichiers/${f}`} target="_blank" className="inline-flex max-w-[16rem] items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-brand-700 ring-1 ring-ink/10">
                        <Paperclip className="h-3 w-3 shrink-0" /> <span className="truncate">{attachmentLabel(f)}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
