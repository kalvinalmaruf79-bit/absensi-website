// src/components/guru/SiswaKelasCard.jsx
"use client";

import { motion } from "framer-motion";
import { User, Eye, History, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

const SiswaKelasCard = ({ siswa, index }) => {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="bg-background-card rounded-lg p-4 shadow-soft hover:shadow-hover transition-all"
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-darkest flex items-center justify-center flex-shrink-0">
          <User className="w-6 h-6 text-white" />
        </div>

        {/* Info Siswa */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-neutral-text truncate">
            {siswa.name}
          </h3>
          <p className="text-sm text-neutral-secondary">{siswa.identifier}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              router.push(`/guru/siswa/${siswa._id}/nilai?kelas=${siswa.kelas}`)
            }
            className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            title="Lihat Nilai"
          >
            <TrendingUp className="w-4 h-4" />
          </button>

          <button
            onClick={() => router.push(`/guru/siswa/${siswa._id}/histori`)}
            className="p-2 rounded-lg bg-info/10 text-info hover:bg-info/20 transition-colors"
            title="Histori Aktivitas"
          >
            <History className="w-4 h-4" />
          </button>

          <button
            onClick={() => router.push(`/guru/siswa/${siswa._id}`)}
            className="p-2 rounded-lg bg-neutral-light/20 text-neutral-secondary hover:bg-neutral-light/30 transition-colors"
            title="Detail Siswa"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SiswaKelasCard;
