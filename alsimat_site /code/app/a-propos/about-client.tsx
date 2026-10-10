"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Building2, Truck, Users, Leaf } from "lucide-react";
import type { AboutContent } from "@/lib/settings";

const statIcons = [Building2, Users, Truck, Leaf];

export function AboutPageClient({ content }: { content: AboutContent }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { ref: ref2, inView: inView2 } = useInView({ triggerOnce: true, threshold: 0.1 });

  const intro = content?.introParagraphs ?? [];
  const body = content?.bodyParagraphs ?? [];
  const stats = content?.stats ?? [];

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-[#2d3436] text-white">
        <div className="max-w-[1200px] mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-3">
            À propos
          </h1>
          <p className="text-gray-400 text-lg">{content?.subtitle ?? 'Qui sommes nous ?'}</p>
        </div>
      </section>

      {/* Content */}
      <section ref={ref} className="py-16 bg-white">
        <div className="max-w-[900px] mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16"
          >
            <div>
              {intro.map((p, i) => (
                <p key={i} className="text-gray-600 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: p }} />
              ))}
            </div>
            <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
              {content?.image && (
                <Image src={content.image} alt="Atelier Alsimat" fill className="object-cover" />
              )}
            </div>
          </motion.div>

          {/* Logo centered */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center mb-16"
          >
            <div className="relative h-14 w-[200px]">
              <Image src="/brand/alsimat-logo.png" alt="Alsimat" fill className="object-contain" />
            </div>
          </motion.div>

          {/* Body content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6 text-gray-600 leading-relaxed"
          >
            {body.map((p, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      {stats.length > 0 && (
        <section ref={ref2} className="py-16 bg-gray-50">
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, i) => {
                const Icon = statIcons[i % statIcons.length];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView2 ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="text-center bg-white rounded-xl p-6 shadow-sm"
                  >
                    <Icon className="w-8 h-8 text-[#7FBF7F] mx-auto mb-3" />
                    <p className="text-3xl font-display font-bold text-[#2d3436] mb-1">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
