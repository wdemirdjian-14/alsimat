"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Zap, Leaf, Shield, Wrench, Volume2, Award } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "100% Électrique",
    desc: "Des performances inégalées pour plus d'efficacité, de fiabilité et d'économie.",
  },
  {
    icon: Leaf,
    title: "Écologique",
    desc: "Zéro émission, zéro bruit, zéro odeur. Respectueux de l'environnement.",
  },
  {
    icon: Shield,
    title: "Fiabilité",
    desc: "Composants de qualité industrielle, batterie plomb-pur sans entretien.",
  },
  {
    icon: Wrench,
    title: "Entretien réduit",
    desc: "Coût d'entretien inférieur de 80% à un véhicule thermique.",
  },
  {
    icon: Volume2,
    title: "Silencieux",
    desc: "Circulez en silence, sans vibrations. Idéal pour les zones sensibles.",
  },
  {
    icon: Award,
    title: "Conçu en France",
    desc: "Véhicules conçus et assemblés en France, dans le Loiret.",
  },
];

export function WhySection() {
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
          <h2 className="text-3xl md:text-4xl font-display font-bold text-[#2d3436] tracking-tight mb-3">
            Pourquoi choisir Alsimat ?
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Des véhicules électriques professionnels alliant performance, écologie et économie
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f: any, i: number) => {
            const Icon = f?.icon ?? Zap;
            return (
              <motion.div
                key={f?.title ?? i}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-[#7FBF7F]/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-[#7FBF7F]" />
                </div>
                <h3 className="text-lg font-semibold text-[#2d3436] mb-2">{f?.title ?? ''}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f?.desc ?? ''}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
