"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Car, Calendar, Gauge, ArrowUpRight } from "lucide-react";

interface Item {
  id: string; name: string; slug: string; price: string | null;
  year: string | null; mileage: string | null; condition: string | null;
  images: string[]; featured: boolean;
}

export function OccasionClient({ items }: { items: Item[] }) {
  return (
    <>
      <section className="relative pt-32 pb-16 bg-[#2d3436] text-white">
        <div className="max-w-[1200px] mx-auto px-4">
          <p className="text-[#7FBF7F] text-sm font-semibold uppercase tracking-wider mb-2">Occasion</p>
          <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-3">Véhicules d'occasion</h1>
          <p className="text-gray-400 text-lg max-w-2xl">Découvrez notre sélection de véhicules électriques d'occasion, révisés et prêts à l'emploi.</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-4">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <Car className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-lg">Aucun véhicule d'occasion disponible pour le moment.</p>
              <Link href="/contact" className="inline-block mt-4 text-[#7FBF7F] font-medium">Contactez-nous pour être informé des prochaines disponibilités</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((v, i) => (
                <motion.div key={v.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.08 }}>
                  <Link href={`/occasion/${v.slug}`} className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
                    <div className="relative aspect-[4/3] bg-gray-100">
                      {v.images?.[0] && <Image src={v.images[0]} alt={v.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />}
                      {v.featured && <div className="absolute top-3 left-3 bg-[#7FBF7F] text-white text-xs font-bold px-3 py-1 rounded-full">À la une</div>}
                      <div className="absolute top-3 right-3 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><ArrowUpRight className="w-5 h-5 text-[#7FBF7F]" /></div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-[#2d3436] group-hover:text-[#7FBF7F] transition-colors">{v.name}</h3>
                      <p className="text-xl font-bold text-[#7FBF7F] mt-1">{v.price || "Prix sur demande"}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        {v.year && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{v.year}</span>}
                        {v.mileage && <span className="flex items-center gap-1"><Gauge className="w-3.5 h-3.5" />{v.mileage}</span>}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
