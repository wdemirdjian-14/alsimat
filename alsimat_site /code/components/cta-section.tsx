"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Phone, ArrowRight } from "lucide-react";

export function CtaSection({
  title = "Un projet ? Une question ?",
  subtitle = "Contactez-nous pour obtenir un devis personnalisé ou pour toute demande d'information.",
}: {
  title?: string;
  subtitle?: string;
}) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section ref={ref} className="py-20 bg-[#2d3436] text-white">
      <div className="max-w-[1200px] mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-4">
            {title}
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
            {subtitle}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="group flex items-center gap-2 bg-[#7FBF7F] text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-[#6aad6a] transition-colors"
            >
              Demander un devis
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="tel:+33620376133"
              className="flex items-center gap-2 border-2 border-white/30 text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:border-white transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span suppressHydrationWarning>06 20 37 61 33</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
