"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { FileText, Loader2, Paperclip, Send, StickyNote, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Action = (prev: string | null, fd: FormData) => Promise<string | null>;
export type MailTemplate = { label: string; subject: string; body: string };

const ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.odt,.ods,.csv,.txt,.zip,.jpg,.jpeg,.png,.webp,.heic,.gif,.mp4,.mov";
const size = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} Mo` : `${Math.max(1, Math.round(n / 1024))} Ko`);

/** Sélecteur de pièces jointes (plusieurs fichiers, 20 Mo au total). */
function Attachments({ files, setFiles }: { files: File[]; setFiles: (f: File[]) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const total = files.reduce((a, f) => a + f.size, 0);
  return (
    <div>
      {files.length > 0 && (
        <ul className="mb-2 space-y-1">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex items-center gap-2 rounded-lg bg-sand px-3 py-1.5 text-sm">
              <FileText className="h-4 w-4 shrink-0 text-ink/50" />
              <span className="min-w-0 flex-1 truncate">{f.name}</span>
              <span className="text-xs text-ink/45">{size(f.size)}</span>
              <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} aria-label={`Retirer ${f.name}`} className="text-red-600"><X className="h-4 w-4" /></button>
            </li>
          ))}
        </ul>
      )}
      <button type="button" onClick={() => input.current?.click()} className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600">
        <Paperclip className="h-4 w-4" /> Joindre des fichiers
      </button>
      {total > 20 * 1048576 && <span className="ml-2 text-xs text-red-600">20 Mo maximum au total</span>}
      <input ref={input} type="file" multiple accept={ACCEPT} className="hidden"
        onChange={(e) => { setFiles([...files, ...Array.from(e.target.files ?? [])]); e.target.value = ""; }} />
    </div>
  );
}

function useComposer(action: Action) {
  const router = useRouter();
  const [msg, run, pending] = useActionState(action, null);
  const [files, setFiles] = useState<File[]>([]);
  const [round, setRound] = useState(0);
  useEffect(() => {
    if (msg?.startsWith("ok")) { setFiles([]); setRound((r) => r + 1); router.refresh(); }
  }, [msg, router]);
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.delete("files");
    files.forEach((f) => fd.append("files", f));
    startTransition(() => run(fd));
  };
  return { msg, pending, files, setFiles, round, submit };
}

/** Message au client (e-mail) : modèles, copie, pièces jointes. Inscrit dans l'historique du contact. */
export function MailComposer({ action, templates, to, closeOption, disabled }: {
  action: Action; templates?: MailTemplate[]; to?: boolean; closeOption?: boolean; disabled?: string;
}) {
  const { msg, pending, files, setFiles, round, submit } = useComposer(action);
  const [tpl, setTpl] = useState(0);
  const [cc, setCc] = useState(false);
  if (disabled) return <p className="text-sm text-ink/55">{disabled}</p>;
  const t = templates?.[tpl];
  const contactId = msg?.startsWith("ok:") ? msg.slice(3) : null;
  return (
    <form key={`${tpl}-${round}`} onSubmit={submit} className="space-y-3">
      {templates && templates.length > 1 && (
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {templates.map((x, i) => (
            <button key={x.label} type="button" onClick={() => setTpl(i)}
              className={cn("shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold", i === tpl ? "bg-brand-500 text-white" : "bg-sand text-ink/70")}>
              {x.label}
            </button>
          ))}
        </div>
      )}
      {to && (
        <div className="grid gap-3 sm:grid-cols-3">
          <input name="to" type="email" required placeholder="Destinataire (e-mail)" className="field sm:col-span-3" />
          <input name="firstName" placeholder="Prénom (si nouveau contact)" className="field" />
          <input name="company" placeholder="Société (si nouveau contact)" className="field sm:col-span-2" />
        </div>
      )}
      {cc ? <input name="cc" type="email" placeholder="Copie à (e-mail)" className="field" />
        : <button type="button" onClick={() => setCc(true)} className="text-xs font-semibold text-ink/55">+ Ajouter une copie (Cc)</button>}
      <input name="subject" defaultValue={t?.subject} placeholder="Objet" className="field" required />
      <textarea name="body" defaultValue={t?.body} rows={9} className="field" placeholder={"Bonjour {{prenom}},\n\n…"} required />
      <p className="text-xs text-ink/50">Champs : {"{{prenom}} {{nom}} {{societe}}"} · **gras** · [lien](https://…) · - liste</p>
      <Attachments files={files} setFiles={setFiles} />
      {closeOption && <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="close" className="h-4 w-4 accent-brand-500" /> Marquer la demande comme traitée</label>}
      {msg && (
        <p className={msg.startsWith("ok") ? "text-sm text-brand-700" : "text-sm text-red-600"}>
          {msg.startsWith("ok") ? "E-mail envoyé et ajouté à l'historique du contact." : msg}
          {contactId && <> <Link href={`/admin/contacts/${contactId}`} className="font-semibold underline">Voir la fiche</Link></>}
        </p>
      )}
      <button disabled={pending} className="btn-primary w-full !py-3 sm:w-auto">{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Envoyer</button>
    </form>
  );
}

/** Note interne (non envoyée au client), avec pièces jointes. */
export function NoteComposer({ action, types }: { action: Action; types?: boolean }) {
  const { msg, pending, files, setFiles, round, submit } = useComposer(action);
  return (
    <form key={round} onSubmit={submit} className="space-y-3">
      {types && (
        <select name="type" className="field !py-2.5" defaultValue="note">
          <option value="note">Note interne</option><option value="appel">Appel</option><option value="rdv">Rendez-vous</option><option value="devis">Devis envoyé</option>
        </select>
      )}
      <textarea name="content" rows={3} className="field" placeholder="Compte rendu, prochaine étape, info interne…" />
      <Attachments files={files} setFiles={setFiles} />
      {msg && !msg.startsWith("ok") && <p className="text-sm text-red-600">{msg}</p>}
      <button disabled={pending} className="btn-dark !py-2.5">{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <StickyNote className="h-4 w-4" />} Ajouter la note</button>
    </form>
  );
}
