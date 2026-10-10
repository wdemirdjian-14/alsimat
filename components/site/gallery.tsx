"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const go = useCallback((d: number) => setIndex((i) => (i + d + images.length) % images.length), [images.length]);

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [zoom, go]);

  if (!images.length) return <div className="aspect-[4/3] rounded-3xl bg-sand" />;

  return (
    <div>
      <div className="group relative aspect-[4/3] overflow-hidden rounded-3xl bg-sand">
        {images.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={i === 0 ? alt : `${alt} – photo ${i + 1}`}
            fill
            priority={i === 0}
            sizes="(min-width: 1024px) 55vw, 100vw"
            className={cn("object-cover transition-all duration-700", i === index ? "scale-100 opacity-100" : "scale-105 opacity-0")}
          />
        ))}
        <button type="button" onClick={() => setZoom(true)} aria-label="Agrandir la photo"
          className="absolute right-4 bottom-4 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-ink shadow-lg backdrop-blur transition hover:scale-110">
          <Expand className="h-5 w-5" />
        </button>
        {images.length > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Photo précédente" className="absolute top-1/2 left-4 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 opacity-0 shadow-lg transition group-hover:opacity-100">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Photo suivante" className="absolute top-1/2 right-4 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 opacity-0 shadow-lg transition group-hover:opacity-100">
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto">
          {images.map((src, i) => (
            <button key={src} type="button" onClick={() => setIndex(i)} aria-label={`Afficher la photo ${i + 1}`}
              className={cn("relative h-20 w-28 shrink-0 overflow-hidden rounded-xl ring-2 transition", i === index ? "ring-brand-500" : "ring-transparent opacity-70 hover:opacity-100")}>
              <Image src={src} alt="" fill sizes="112px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
      {zoom && (
        <div role="dialog" aria-modal="true" aria-label={alt} className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/95 p-4" onClick={() => setZoom(false)}>
          <button type="button" aria-label="Fermer" className="absolute top-4 right-4 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
            <X className="h-6 w-6" />
          </button>
          <div className="relative h-full max-h-[85vh] w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
            <Image src={images[index]} alt={alt} fill sizes="100vw" className="object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
