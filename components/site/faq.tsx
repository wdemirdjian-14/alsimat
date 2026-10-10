import { Plus } from "lucide-react";
import { JsonLd } from "./json-ld";

export type FaqItem = { q: string; a: string };

export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <>
      <div className="divide-y divide-ink/10 border-y border-ink/10">
        {items.map((it, i) => (
          <details key={i} data-reveal className="group py-1" name="faq">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-lg font-semibold text-ink [&::-webkit-details-marker]:hidden">
              {it.q}
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600 transition duration-300 group-open:rotate-45 group-open:bg-brand-500 group-open:text-white">
                <Plus className="h-5 w-5" aria-hidden />
              </span>
            </summary>
            <p className="pr-14 pb-6 leading-relaxed text-ink-soft">{it.a}</p>
          </details>
        ))}
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((it) => ({ "@type": "Question", name: it.q, acceptedAnswer: { "@type": "Answer", text: it.a } })),
        }}
      />
    </>
  );
}
