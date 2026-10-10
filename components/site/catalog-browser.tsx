"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { keySpecs, type VehicleWithCats } from "@/lib/specs";
import { cn } from "@/lib/utils";
import { VehicleCard } from "./vehicle-card";

const SEATS = [
  { label: "Toutes", test: () => true },
  { label: "2 places", test: (n: number | null) => n === 2 },
  { label: "4 places", test: (n: number | null) => n === 4 },
  { label: "6 places", test: (n: number | null) => n === 6 },
  { label: "8 places et +", test: (n: number | null) => (n ?? 0) >= 8 },
];

const SORTS = {
  default: "Recommandés",
  priceAsc: "Prix croissant",
  priceDesc: "Prix décroissant",
  range: "Autonomie",
  seats: "Nombre de places",
} as const;

export function CatalogBrowser({ vehicles }: { vehicles: VehicleWithCats[] }) {
  const [seat, setSeat] = useState(0);
  const [road, setRoad] = useState(false);
  const [cargo, setCargo] = useState(false);
  const [sort, setSort] = useState<keyof typeof SORTS>("default");

  const enriched = useMemo(() => vehicles.map((v) => ({ v, s: keySpecs(v) })), [vehicles]);
  const seatOptions = SEATS.filter((o, i) => {
    if (i === 0) return true;
    const n = enriched.filter(({ s }) => o.test(s.seats)).length;
    return n > 0 && n < enriched.length; // inutile d'afficher un filtre qui ne filtre rien
  });
  const hasRoad = enriched.some(({ s }) => s.roadLegal) && enriched.some(({ s }) => !s.roadLegal);
  const hasCargo = enriched.some(({ s }) => s.cargo) && enriched.some(({ s }) => !s.cargo);

  const list = useMemo(() => {
    const filtered = enriched.filter(
      ({ s }) => seatOptions[seat]?.test(s.seats) !== false && (!road || s.roadLegal) && (!cargo || s.cargo),
    );
    const n = (x: number | null, fallback: number) => x ?? fallback;
    const sorters: Record<string, (a: (typeof enriched)[0], b: (typeof enriched)[0]) => number> = {
      priceAsc: (a, b) => n(a.s.price, Infinity) - n(b.s.price, Infinity),
      priceDesc: (a, b) => n(b.s.price, -1) - n(a.s.price, -1),
      range: (a, b) => n(b.s.rangeKm, 0) - n(a.s.rangeKm, 0),
      seats: (a, b) => n(a.s.seats, 0) - n(b.s.seats, 0),
    };
    return sort === "default" ? filtered : [...filtered].sort(sorters[sort]);
  }, [enriched, seat, road, cargo, sort, seatOptions]);

  const showFilters = vehicles.length > 4;

  return (
    <div>
      {showFilters && (
        <div className="sticky top-16 z-30 -mx-4 mb-8 border-b border-ink/5 bg-white/90 px-4 py-3 backdrop-blur-xl sm:mx-0 sm:rounded-2xl sm:border sm:px-4 lg:top-[116px]">
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="mr-1 hidden h-4 w-4 text-ink/50 sm:block" aria-hidden />
            <div className="scrollbar-none flex gap-1.5 overflow-x-auto" role="group" aria-label="Nombre de places">
              {seatOptions.map((o, i) => (
                <button
                  key={o.label}
                  type="button"
                  onClick={() => setSeat(i)}
                  aria-pressed={seat === i}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition",
                    seat === i ? "bg-ink text-white" : "bg-sand text-ink hover:bg-brand-50",
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
            {hasRoad && (
              <button type="button" onClick={() => setRoad((r) => !r)} aria-pressed={road}
                className={cn("shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition", road ? "border-brand-500 bg-brand-50 text-brand-700" : "border-ink/10 hover:border-ink/30")}>
                Homologué route
              </button>
            )}
            {hasCargo && (
              <button type="button" onClick={() => setCargo((c) => !c)} aria-pressed={cargo}
                className={cn("shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition", cargo ? "border-brand-500 bg-brand-50 text-brand-700" : "border-ink/10 hover:border-ink/30")}>
                Transport de matériel
              </button>
            )}
            <label className="ml-auto flex items-center gap-2 text-sm text-ink/60">
              <span className="hidden sm:inline">Trier :</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as keyof typeof SORTS)} className="rounded-full border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none">
                {Object.entries(SORTS).map(([k, l]) => (
                  <option key={k} value={k}>{l}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      )}
      <p className="mb-6 text-sm text-ink/55" aria-live="polite">
        {list.length} modèle{list.length > 1 ? "s" : ""}
      </p>
      {list.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map(({ v }, i) => (
            <VehicleCard key={v.id} vehicle={v} priority={i < 4} delay={(i % 4) * 60} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl bg-sand p-10 text-center text-ink-soft">
          Aucun modèle ne correspond à ces critères.{" "}
          <button type="button" className="font-semibold text-brand-600 underline" onClick={() => { setSeat(0); setRoad(false); setCargo(false); }}>
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </div>
  );
}
