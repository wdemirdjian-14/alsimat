"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, X } from "lucide-react";
import { uploadImages } from "@/app/admin/actions/upload";

/** Gestion d'une ou plusieurs images : envoi (converties en WebP), réordonnancement, suppression. */
export function ImageInput({ name, defaultValue, multiple = false, hint }: { name: string; defaultValue: string[]; multiple?: boolean; hint?: string }) {
  const [images, setImages] = useState(defaultValue.filter(Boolean));
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const input = useRef<HTMLInputElement>(null);

  const onFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const fd = new FormData();
    [...files].forEach((f) => fd.append("files", f));
    fd.append("hint", (document.querySelector<HTMLInputElement>('input[name="name"],input[name="title"]')?.value ?? "").trim());
    setError("");
    start(async () => {
      const res = await uploadImages(fd);
      if (res.error) setError(res.error);
      setImages((cur) => (multiple ? [...cur, ...res.urls] : res.urls.slice(0, 1)));
      if (input.current) input.current.value = "";
    });
  };
  const move = (i: number, d: number) =>
    setImages((cur) => {
      const next = [...cur];
      [next[i], next[i + d]] = [next[i + d], next[i]];
      return next;
    });

  return (
    <div>
      <input type="hidden" name={name} value={multiple ? JSON.stringify(images) : images[0] ?? ""} />
      <div className="flex flex-wrap gap-3">
        {images.map((src, i) => (
          <div key={src + i} className="group relative h-28 w-36 overflow-hidden rounded-xl bg-sand ring-1 ring-ink/10">
            <Image src={src} alt="" fill sizes="144px" className="object-cover" />
            {multiple && i === 0 && <span className="absolute bottom-1 left-1 rounded bg-ink/80 px-1.5 py-0.5 text-[10px] font-bold text-white">Principale</span>}
            <div className="absolute inset-x-1 top-1 flex justify-between opacity-0 transition group-hover:opacity-100">
              <span className="flex gap-1">
                {multiple && i > 0 && <button type="button" onClick={() => move(i, -1)} aria-label="Déplacer à gauche" className="grid h-7 w-7 place-items-center rounded-full bg-white shadow"><ArrowLeft className="h-3.5 w-3.5" /></button>}
                {multiple && i < images.length - 1 && <button type="button" onClick={() => move(i, 1)} aria-label="Déplacer à droite" className="grid h-7 w-7 place-items-center rounded-full bg-white shadow"><ArrowRight className="h-3.5 w-3.5" /></button>}
              </span>
              <button type="button" onClick={() => setImages((c) => c.filter((_, j) => j !== i))} aria-label="Retirer l'image" className="grid h-7 w-7 place-items-center rounded-full bg-white text-red-600 shadow"><X className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        ))}
        {(multiple || images.length === 0) && (
          <button type="button" onClick={() => input.current?.click()} disabled={pending}
            className="grid h-28 w-36 place-items-center rounded-xl border-2 border-dashed border-ink/15 text-ink/50 transition hover:border-brand-500 hover:text-brand-600">
            {pending ? <Loader2 className="h-6 w-6 animate-spin" /> : <span className="flex flex-col items-center gap-1 text-xs font-semibold"><ImagePlus className="h-6 w-6" /> Ajouter</span>}
          </button>
        )}
        {!multiple && images.length > 0 && (
          <button type="button" onClick={() => input.current?.click()} className="self-end text-xs font-semibold text-brand-600 underline">Remplacer</button>
        )}
      </div>
      <input ref={input} type="file" accept="image/*" multiple={multiple} className="hidden" onChange={(e) => onFiles(e.target.files)} />
      {hint && <p className="mt-2 text-xs text-ink/50">{hint}</p>}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
