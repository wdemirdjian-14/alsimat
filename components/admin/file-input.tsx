"use client";

import { useRef, useState, useTransition } from "react";
import { FileUp, Loader2, X } from "lucide-react";
import { uploadFile } from "@/app/admin/actions/upload";

/** Envoi d'un fichier unique (vidéo MP4 ou PDF), conservé tel quel. */
export function FileInput({ name, defaultValue, accept, label, hint }: { name: string; defaultValue?: string | null; accept: string; label: string; hint?: string }) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const input = useRef<HTMLInputElement>(null);
  const onFile = (f?: File) => {
    if (!f) return;
    const fd = new FormData();
    fd.append("file", f);
    fd.append("hint", `${(document.querySelector<HTMLInputElement>('input[name="name"]')?.value ?? "").trim()} ${label}`);
    setError("");
    start(async () => {
      const res = await uploadFile(fd);
      if (res.error) setError(res.error);
      if (res.url) setUrl(res.url);
      if (input.current) input.current.value = "";
    });
  };
  return (
    <div>
      <span className="label">{label}</span>
      <input type="hidden" name={name} value={url} />
      <div className="flex flex-wrap items-center gap-3">
        {url ? (
          <span className="flex items-center gap-2 rounded-xl bg-sand px-3 py-2 text-sm">
            <a href={url} target="_blank" className="max-w-[16rem] truncate font-medium text-brand-600 underline">{url.split("/").pop()}</a>
            <button type="button" onClick={() => setUrl("")} aria-label="Retirer" className="text-red-600"><X className="h-4 w-4" /></button>
          </span>
        ) : null}
        <button type="button" onClick={() => input.current?.click()} disabled={pending} className="btn-ghost !py-2 text-ink">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />} {url ? "Remplacer" : "Envoyer"}
        </button>
      </div>
      <input ref={input} type="file" accept={accept} className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      {hint && <p className="mt-1 text-xs text-ink/50">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
