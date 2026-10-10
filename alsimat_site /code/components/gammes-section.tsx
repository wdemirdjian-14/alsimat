"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useInView } from "react-intersection-observer";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
}

export function GammesSection({
  categories,
  title = "Nos gammes",
  subtitle = "Retrouvez tous les produits Alsimat",
}: {
  categories: Category[];
  title?: string;
  subtitle?: string;
}) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="max-w-[1200px] mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-[#2d3436] tracking-tight mb-3">
            {title}
          </h2>
          <p className="text-[#7FBF7F] text-lg">
            {subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(categories ?? []).map((cat: Category, i: number) => (
            <motion.div
              key={cat?.id ?? i}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link href={`/gammes/${cat?.slug ?? ''}`} className="group block">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 mb-4">
                  {cat?.image && (
                    <Image
                      src={cat.image}
                      alt={cat?.name ?? 'Catégorie'}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <div className="absolute top-3 right-3 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-5 h-5 text-[#7FBF7F]" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-[#2d3436] group-hover:text-[#7FBF7F] transition-colors mb-1">
                  {cat?.name ?? ''}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {cat?.description ?? ''}
                </p>
                <div className="mt-3">
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-[#7FBF7F] group-hover:gap-2 transition-all">
                    Voir la gamme
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
