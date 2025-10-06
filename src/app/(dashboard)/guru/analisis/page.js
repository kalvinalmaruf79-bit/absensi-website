"use client";
import { motion } from "framer-motion";
import AnalisisKinerja from "@/components/guru/AnalisisKinerja";
import { BarChart3 } from "lucide-react";

export default function AnalisisPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative rounded-2xl p-8 text-white overflow-hidden shadow-xl"
        style={{
          background: "linear-gradient(135deg, #00b2e2 0%, #005f8b 100%)",
        }}
      >
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12, duration: 0.4 }}
            className="flex items-center gap-3 mb-2"
          >
            <BarChart3 className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Analisis Kinerja Siswa</h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-white/90"
          >
            Pantau dan analisis perkembangan akademik siswa secara detail
          </motion.p>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute right-20 bottom-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2" />
      </motion.div>

      {/* Komponen Analisis */}
      <AnalisisKinerja />
    </div>
  );
}
