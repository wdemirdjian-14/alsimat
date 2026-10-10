"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronRight, Home, MessageCircle, Phone, Check } from "lucide-react";

interface VehicleProps {
  vehicle: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    shortDescription: string | null;
    price: string | null;
    characteristics: Record<string, string>;
    images: string[];
  };
  categories: { name: string; slug: string }[];
}

export function VehicleDetailClient({ vehicle, categories }: VehicleProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const images = vehicle?.images ?? [];
  const chars = vehicle?.characteristics ?? {};

  return (
    <>
      {/* Breadcrumb */}
      <section className="pt-28 pb-4 bg-gray-100">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-[#7FBF7F] transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" /> Accueil
            </Link>
            <ChevronRight className="w-3 h-3" />
            {(categories ?? [])?.[0] && (
              <>
                <Link href={`/gammes/${categories[0]?.slug ?? ''}`} className="hover:text-[#7FBF7F] transition-colors">
                  {categories[0]?.name ?? ''}
                </Link>
                <ChevronRight className="w-3 h-3" />
              </>
            )}
            <span className="text-[#2d3436] font-medium">{vehicle?.name ?? ''}</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-white">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Images */}
            <div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 mb-4"
              >
                {images?.[selectedImage] && (
                  <Image
                    src={images[selectedImage]}
                    alt={vehicle?.name ?? 'Véhicule'}
                    fill
                    className="object-cover"
                  />
                )}
              </motion.div>
              {(images?.length ?? 0) > 1 && (
                <div className="flex gap-3 overflow-x-auto">
                  {images.map((img: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                        selectedImage === i ? "border-[#7FBF7F]" : "border-transparent"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${vehicle?.name ?? 'Véhicule'} - vue ${i + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-[#2d3436] tracking-tight mb-4">
                {vehicle?.name ?? ''}
              </h1>

              {vehicle?.price && (
                <p className="text-2xl font-bold text-[#7FBF7F] mb-6">{vehicle.price}</p>
              )}

              {vehicle?.shortDescription && (
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  {vehicle.shortDescription}
                </p>
              )}

              {vehicle?.description && (
                <div className="prose prose-gray max-w-none mb-8">
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {vehicle.description}
                  </p>
                </div>
              )}

              {/* Characteristics */}
              {Object.keys(chars ?? {})?.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-[#2d3436] mb-4">Caractéristiques techniques</h3>
                  <div className="space-y-3">
                    {Object.entries(chars ?? {}).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-[#7FBF7F] mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium text-[#2d3436]">{key}</span>
                          <span className="text-gray-500"> : {value ?? ''}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/contact"
                  className="flex items-center justify-center gap-2 bg-[#7FBF7F] text-white px-6 py-3 rounded-full font-medium hover:bg-[#6aad6a] transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Demander un devis
                </Link>
                <a
                  href="tel:+33620376133"
                  className="flex items-center justify-center gap-2 border-2 border-[#2d3436] text-[#2d3436] px-6 py-3 rounded-full font-medium hover:bg-[#2d3436] hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span suppressHydrationWarning>06 20 37 61 33</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
