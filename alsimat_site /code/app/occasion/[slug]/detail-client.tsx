"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, Calendar, Gauge, BadgeCheck, Tag } from "lucide-react";
import { QuoteForm } from "@/components/quote-form";

interface Vehicle {
  id: string;
  name: string;
  description: string | null;
  price: string | null;
  year: string | null;
  mileage: string | null;
  condition: string | null;
  images: string[];
  sold: boolean;
  characteristics: Record<string, string>;
}

export function OccasionDetailClient({ vehicle }: { vehicle: Vehicle }) {
  const [active, setActive] = useState(0);
  const images = vehicle.images?.length ? vehicle.images : [];
  const specs = [
    vehicle.year && { icon: Calendar, label: "Année", value: vehicle.year },
    vehicle.mileage && { icon: Gauge, label: "Compteur", value: vehicle.mileage },
    vehicle.condition && { icon: BadgeCheck, label: "État", value: vehicle.condition },
  ].filter(Boolean) as { icon: any; label: string; value: string }[];

  return (
    <>
      <section className="pt-28 pb-6 bg-[#2d3436] text-white">
        <div className="max-w-[1200px] mx-auto px-4">
          <Link href="/occasion" className="inline-flex items-center gap-1 text-gray-300 hover:text-white text-sm mb-4">
            <ChevronLeft className="w-4 h-4" /> Retour aux véhicules d'occasion
          </Link>
          <p className="text-[#7FBF7F] text-sm font-semibold uppercase tracking-wider mb-2">Occasion</p>
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">{vehicle.name}</h1>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Gallery */}
          <div>
            <div className="relative aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden">
              {images[active] ? (
                <Image src={images[active]} alt={vehicle.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <Tag className="w-12 h-12" />
                </div>
              )}
              {vehicle.sold && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">Vendu</div>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2 mt-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      i === active ? "border-[#7FBF7F]" : "border-transparent"
                    }`}
                  >
                    <Image src={img} alt={`${vehicle.name} ${i + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="text-3xl font-bold text-[#7FBF7F]">{vehicle.price || "Prix sur demande"}</p>

            {specs.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
                {specs.map((s, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4 text-center">
                    <s.icon className="w-5 h-5 text-[#7FBF7F] mx-auto mb-1" />
                    <p className="text-xs text-gray-500">{s.label}</p>
                    <p className="font-semibold text-[#2d3436]">{s.value}</p>
                  </div>
                ))}
              </div>
            )}

            {vehicle.description && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-[#2d3436] mb-2">Description</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{vehicle.description}</p>
              </div>
            )}

            {Object.keys(vehicle.characteristics).length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-[#2d3436] mb-2">Caractéristiques</h2>
                <dl className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                  {Object.entries(vehicle.characteristics).map(([k, val]) => (
                    <div key={k} className="flex justify-between px-4 py-2.5 text-sm">
                      <dt className="text-gray-500">{k}</dt>
                      <dd className="font-medium text-[#2d3436]">{val}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-[720px] mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-sm p-8"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-display font-bold text-[#2d3436]">Intéressé par ce véhicule ?</h2>
              <p className="text-gray-500 mt-1">Laissez-nous vos coordonnées, nous vous recontactons rapidement.</p>
            </div>
            <QuoteForm source="Occasion" vehicleRef={vehicle.name} />
          </motion.div>
        </div>
      </section>
    </>
  );
}
