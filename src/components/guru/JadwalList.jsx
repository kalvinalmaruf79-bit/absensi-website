"use client";

import { motion } from "framer-motion";
import { Clock, Users, BookOpen, MapPin, QrCode, Loader2 } from "lucide-react";
import Card from "@/components/ui/Card";

export default function JadwalList({
  jadwalHariIni,
  sesiAktif,
  onMulaiSesi,
  onAbsenManual,
  isGeneratingQR,
}) {
  const isJadwalAktif = (jadwal) => {
    return sesiAktif?.jadwalId === jadwal._id;
  };

  const formatWaktu = (jamMulai, jamSelesai) => {
    return `${jamMulai} - ${jamSelesai} WIB`;
  };

  if (jadwalHariIni.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-neutral-light/20 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-neutral-light" />
          </div>
          <p className="text-neutral-secondary">
            Tidak ada jadwal mengajar hari ini
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-neutral-text">Jadwal Hari Ini</h2>
        <span className="text-sm text-neutral-secondary">
          {jadwalHariIni.length} Kelas
        </span>
      </div>

      {jadwalHariIni.map((jadwal, index) => {
        const isAktif = isJadwalAktif(jadwal);

        return (
          <motion.div
            key={jadwal._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={`transition-all ${
                isAktif
                  ? "border-2 border-success bg-success/5 shadow-lg shadow-success/10"
                  : "hover:shadow-lg"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-lg text-neutral-text">
                      {jadwal.mataPelajaran?.nama || "Mata Pelajaran"}
                    </h3>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-neutral-secondary">
                      <Users className="w-4 h-4" />
                      <span>{jadwal.kelas?.nama || "Kelas"}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-neutral-secondary">
                      <Clock className="w-4 h-4" />
                      <span>
                        {formatWaktu(jadwal.jamMulai, jadwal.jamSelesai)}
                      </span>
                    </div>
                  </div>
                </div>

                {isAktif && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 border border-success/20 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-xs font-semibold text-success">
                      Aktif
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => onMulaiSesi(jadwal)}
                  disabled={isAktif || isGeneratingQR}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                    isAktif
                      ? "bg-neutral-light/20 text-neutral-light cursor-not-allowed"
                      : "bg-gradient-to-r from-primary to-primary-dark text-white hover:shadow-lg hover:scale-105"
                  }`}
                >
                  {isGeneratingQR ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <QrCode className="w-5 h-5" />
                      <span>{isAktif ? "Sesi Aktif" : "Mulai Sesi"}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onAbsenManual(jadwal)}
                  className="px-6 py-3 bg-white border-2 border-primary text-primary hover:bg-primary/5 rounded-xl font-medium transition-all hover:scale-105 flex items-center gap-2"
                >
                  <MapPin className="w-5 h-5" />
                  <span className="hidden sm:inline">Absen Manual</span>
                </button>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
