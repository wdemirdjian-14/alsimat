import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BatteryCharging, Gauge, Users } from "lucide-react";
import { keySpecs, type VehicleWithCats } from "@/lib/specs";
import { formatPrice } from "@/lib/utils";

export function VehicleCard({ vehicle, priority = false, delay = 0 }: { vehicle: VehicleWithCats; priority?: boolean; delay?: number }) {
  const s = keySpecs(vehicle);
  const image = vehicle.images[0];
  return (
    <article
      data-reveal
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
      className="group card-lift relative flex flex-col overflow-hidden rounded-3xl border border-ink/5 bg-white"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-sand">
        {image && (
          <Image
            src={image}
            alt={`${vehicle.name} – golfette électrique Alsimat`}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {s.roadLegal && <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-ink backdrop-blur">Homologué route</span>}
          {vehicle.featured && <span className="rounded-full bg-brand-500 px-2.5 py-1 text-[11px] font-semibold text-white">Coup de cœur</span>}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl font-bold">
          <Link href={`/vehicules/${vehicle.slug}`} className="after:absolute after:inset-0">
            {vehicle.name}
          </Link>
        </h3>
        <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-ink-soft">
          {s.seats && (
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-brand-500" aria-hidden />
              <dt className="sr-only">Places</dt>
              <dd>{s.seats} places</dd>
            </div>
          )}
          {s.rangeKm && (
            <div className="flex items-center gap-1.5">
              <BatteryCharging className="h-4 w-4 text-brand-500" aria-hidden />
              <dt className="sr-only">Autonomie</dt>
              <dd>{s.rangeKm} km</dd>
            </div>
          )}
          {s.speedKmh && (
            <div className="flex items-center gap-1.5">
              <Gauge className="h-4 w-4 text-brand-500" aria-hidden />
              <dt className="sr-only">Vitesse maximale</dt>
              <dd>{s.speedKmh} km/h</dd>
            </div>
          )}
        </dl>
        <div className="mt-auto flex items-end justify-between pt-5">
          <p className="text-sm">
            {s.price ? <span className="text-ink/50">À partir de </span> : null}
            <span className="block text-lg font-bold text-ink">{formatPrice(vehicle.price)}</span>
          </p>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-50 text-brand-600 transition-all duration-300 group-hover:rotate-45 group-hover:bg-brand-500 group-hover:text-white">
            <ArrowUpRight className="h-5 w-5" aria-hidden />
          </span>
        </div>
      </div>
    </article>
  );
}
