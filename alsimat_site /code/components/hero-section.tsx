"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle } from "lucide-react";
import type { HomeContent } from "@/lib/settings";

export function HeroSection({ content }: { content: HomeContent }) {
  return (
    <section className="relative h-screen min-h-[600px] max-h-[900px] flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src={content.heroImage || "https://cdn.abacus.ai/images/38c68639-0dde-4fe2-bb70-8dd2d633e775.png"}
          alt="Nacelle électrique Alsimat en atelier industriel"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-[900px] mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white tracking-tight mb-4"
        >
          {content.heroTitle}{" "}
          <span className="text-[#7FBF7F]">{content.heroHighlight}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-[#7FBF7F] mb-10"
        >
          {content.heroSubtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/gammes/tracteurs-electriques"
            className="group flex items-center gap-2 bg-white text-[#2d3436] px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-[#7FBF7F] hover:text-white transition-all duration-300"
          >
            Découvrir nos gammes
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/contact"
            className="group flex items-center gap-2 border-2 border-white text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-white hover:text-[#2d3436] transition-all duration-300"
          >
            <MessageCircle className="w-4 h-4" />
            Nous contacter
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center pt-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-1.5 h-1.5 bg-white rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
}
