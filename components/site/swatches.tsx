"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const COLOR_MAP: Record<string, string> = {
  blanc: "#f8f8f6", noir: "#151515", bleu: "#1f4fa8", sable: "#e9c98f", beige: "#e9c98f", vert: "#1f5a35", jaune: "#f2cf2b",
  rouge: "#d52b2b", gris: "#8a8f94", orange: "#ef7d22", caramel: "#c48a55", kaki: "#7b7a4b", marron: "#6b4423",
  camouflage: "linear-gradient(135deg,#4b5320 0 25%,#8b7d4f 25% 45%,#2f3a1f 45% 70%,#a39a6a 70%)",
  personnalisée: "conic-gradient(#e53935,#fbc02d,#43a047,#1e88e5,#8e24aa,#e53935)",
};

/** "Kaki & beige" -> dégradé moitié/moitié */
function swatch(name: string) {
  const parts = name.toLowerCase().split(/\s*&\s*|\s+et\s+/).map((p) => COLOR_MAP[p.trim()] ?? null);
  if (parts.length === 2 && parts[0] && parts[1] && !parts[0].includes("gradient")) return `linear-gradient(135deg, ${parts[0]} 50%, ${parts[1]} 50%)`;
  return parts[0] ?? COLOR_MAP[name.toLowerCase()] ?? "#ccc";
}

export function Swatches({ title, items }: { title: string; items: string[] }) {
  const [active, setActive] = useState(0);
  if (!items.length) return null;
  return (
    <div>
      <p className="text-sm text-white/60">{title}</p>
      <p className="mt-1 font-display text-2xl font-bold">{items[active]}</p>
      <div className="mt-4 flex flex-wrap gap-3" role="radiogroup" aria-label={title}>
        {items.map((c, i) => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={i === active}
            aria-label={c}
            title={c}
            onClick={() => setActive(i)}
            onMouseEnter={() => setActive(i)}
            className={cn("relative grid h-12 w-12 place-items-center rounded-full ring-2 ring-offset-4 ring-offset-ink transition duration-300 hover:scale-110", i === active ? "scale-110 ring-brand-300" : "ring-white/15")}
            style={{ background: swatch(c) }}
          >
            {i === active && <Check className="h-5 w-5 text-white mix-blend-difference" aria-hidden />}
          </button>
        ))}
      </div>
    </div>
  );
}
