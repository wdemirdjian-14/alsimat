"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Calendar, Eye } from "lucide-react";
import { useState } from "react";

interface ProjectItem {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  date: string | null;
}

export function RealisationsClient({ projects }: { projects: ProjectItem[] }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-[#2d3436] text-white">
        <div className="max-w-[1200px] mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-3">
            Réalisations
          </h1>
          <p className="text-gray-400 text-lg">
            Découvrez nos projets et installations
          </p>
        </div>
      </section>

      {/* Grid */}
      <section ref={ref} className="py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(projects ?? []).map((p: ProjectItem, i: number) => (
              <motion.div
                key={p?.id ?? i}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group cursor-pointer"
                onClick={() => setSelectedProject(p)}
              >
                <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 mb-4">
                  {p?.image && (
                    <Image
                      src={p.image}
                      alt={p?.title ?? 'Projet'}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-[#2d3436] group-hover:text-[#7FBF7F] transition-colors mb-1">
                  {p?.title ?? ''}
                </h3>
                {p?.date && (
                  <div className="flex items-center gap-1 text-sm text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {p.date}
                  </div>
                )}
                {p?.description && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{p.description}</p>
                )}
              </motion.div>
            ))}
          </div>

          {(projects ?? [])?.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">Aucune réalisation pour le moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      {selectedProject && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedProject(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e: any) => e?.stopPropagation?.()}
          >
            <div className="relative aspect-video">
              {selectedProject?.image && (
                <Image
                  src={selectedProject.image}
                  alt={selectedProject?.title ?? ''}
                  fill
                  className="object-cover rounded-t-2xl"
                />
              )}
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-display font-bold text-[#2d3436] mb-2">
                {selectedProject?.title ?? ''}
              </h2>
              {selectedProject?.date && (
                <p className="text-sm text-[#7FBF7F] mb-4">{selectedProject.date}</p>
              )}
              {selectedProject?.description && (
                <p className="text-gray-600 leading-relaxed">{selectedProject.description}</p>
              )}
              <button
                onClick={() => setSelectedProject(null)}
                className="mt-6 bg-[#2d3436] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#2d3436]/80 transition-colors"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
