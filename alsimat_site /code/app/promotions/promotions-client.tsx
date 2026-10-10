"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Tag, ArrowRight } from "lucide-react";

interface Promo {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  discount: string | null;
  badge: string | null;
  ctaLabel: string | null;
  ctaLink: string | null;
}

export function PromotionsClient({ items }: { items: Promo[] }) {
  return (
    <>
      <section className="relative pt-32 pb-16 bg-[#2d3436] text-white">
        <div className="max-w-[1200px] mx-auto px-4">
          <p className="text-[#7FBF7F] text-sm font-semibold uppercase tracking-wider mb-2">Offres du moment</p>
          <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-3">Nos promotions</h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Profitez de nos offres spéciales sur une sélection de tracteurs, nacelles et tricycles électriques.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-4">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-lg">Aucune promotion en cours pour le moment.</p>
              <Link href="/contact" className="inline-block mt-4 text-[#7FBF7F] font-medium">
                Contactez-nous pour connaître nos meilleures offres
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-100 flex flex-col"
                >
                  <div className="relative aspect-[16/10] bg-gray-100">
                    {p.image && <Image src={p.image} alt={p.title} fill className="object-cover" />}
                    {(p.badge || p.discount) && (
                      <div className="absolute top-3 left-3 bg-[#7FBF7F] text-white text-sm font-bold px-3 py-1 rounded-full">
                        {p.badge || p.discount}
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-lg font-semibold text-[#2d3436] mb-2">{p.title}</h3>
                    {p.description && <p className="text-sm text-gray-500 mb-4 flex-1">{p.description}</p>}
                    <Link
                      href={p.ctaLink || "/contact"}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-[#7FBF7F] hover:gap-2 transition-all mt-auto"
                    >
                      {p.ctaLabel || "En profiter"}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
