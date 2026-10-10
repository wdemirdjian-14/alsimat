"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, ChevronRight, Home } from "lucide-react";

interface CategoryProps {
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
  };
  subCategories?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
  }[];
  vehicles: {
    id: string;
    name: string;
    slug: string;
    shortDescription: string | null;
    images: string[];
  }[];
}

export function CategoryPageClient({ category, subCategories = [], vehicles }: CategoryProps) {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-[#2d3436] text-white">
        <div className="max-w-[1200px] mx-auto px-4">
          <p className="text-[#7FBF7F] text-sm font-semibold uppercase tracking-wider mb-2">
            Produits
          </p>
          <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-3">
            {category?.name ?? ''}
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Découvrez tous les produits Alsimat de la gamme {category?.name ?? ''}
          </p>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mt-6 text-sm text-gray-400">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" /> Accueil
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">{category?.name ?? ''}</span>
          </div>
        </div>
      </section>

      {/* Description */}
      {category?.description && (
        <section className="py-12 bg-white">
          <div className="max-w-[900px] mx-auto px-4">
            <div className="bg-gray-50 rounded-2xl p-8">
              <p className="text-gray-600 leading-relaxed">
                {category.description}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Sub-categories grid */}
      {subCategories.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-[1200px] mx-auto px-4">
            <h2 className="text-2xl font-display font-bold text-[#2d3436] mb-8 text-center">
              Sous-gammes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {subCategories.map((sc, i) => (
                <motion.div
                  key={sc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Link href={`/gammes/${sc.slug}`} className="group block">
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 mb-3">
                      {sc.image && (
                        <Image
                          src={sc.image}
                          alt={sc.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-[#2d3436] group-hover:text-[#7FBF7F] transition-colors">
                      {sc.name}
                    </h3>
                    {sc.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">{sc.description}</p>
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Vehicles grid */}
      <section className="py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {(vehicles ?? []).map((v: any, i: number) => (
              <motion.div
                key={v?.id ?? i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link href={`/vehicules/${v?.slug ?? ''}`} className="group block">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 mb-4">
                    {(v?.images ?? [])?.[0] && (
                      <Image
                        src={v.images[0]}
                        alt={v?.name ?? 'Véhicule'}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute top-3 right-3 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight className="w-5 h-5 text-[#7FBF7F]" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-[#2d3436] group-hover:text-[#7FBF7F] transition-colors mb-1">
                    {v?.name ?? ''}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                    {v?.shortDescription ?? ''}
                  </p>
                  <span className="inline-flex items-center gap-1 bg-[#7FBF7F] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#6aad6a] transition-colors">
                    Voir le produit
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>

          {(vehicles ?? [])?.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">Aucun véhicule dans cette catégorie pour le moment.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
