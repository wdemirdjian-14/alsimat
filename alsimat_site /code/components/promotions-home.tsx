"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
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

export function PromotionsHome({ promotions }: { promotions: Promo[] }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section ref={ref} className="py-20 bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-[#7FBF7F]/10 text-[#7FBF7F] px-4 py-1.5 rounded-full text-sm font-medium mb-3">
            <Tag className="w-4 h-4" />
            Offres du moment
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-[#2d3436] tracking-tight">
            Nos promotions
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="relative aspect-[16/10] bg-gray-100">
                {p.image && (
                  <Image src={p.image} alt={p.title} fill className="object-cover" />
                )}
                {(p.badge || p.discount) && (
                  <div className="absolute top-3 left-3 bg-[#7FBF7F] text-white text-sm font-bold px-3 py-1 rounded-full">
                    {p.badge || p.discount}
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-[#2d3436] mb-1">{p.title}</h3>
                {p.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{p.description}</p>
                )}
                <Link
                  href={p.ctaLink || "/promotions"}
                  className="inline-flex items-center gap-1 text-sm font-medium text-[#7FBF7F] hover:gap-2 transition-all"
                >
                  {p.ctaLabel || "En profiter"}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/promotions"
            className="inline-flex items-center gap-2 bg-[#2d3436] text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-[#2d3436]/80 transition-colors"
          >
            Voir toutes les promotions
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
