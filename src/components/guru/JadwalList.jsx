// src/components/guru/JadwalList.jsx
import { motion } from "framer-motion";
import { Clock, BookOpen, Users, Play, Loader2 } from "lucide-react";
import Card from "@/components/ui/Card";

export default function JadwalList({
  jadwalHariIni,
  sesiAktif,
  onMulaiSesi,
  isGeneratingQR,
}) {
  const formatTime = (time) => {
    return time ? time.substring(0, 5) : "-";
  };

  const isJadwalAktif = (jadwalId) => {
    return sesiAktif?.jadwalId === jadwalId;
  };

  return (
    <Card>
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-xl font-bold text-neutral-text">
            Jadwal Mengajar Hari Ini
          </h2>
          <p className="text-sm text-neutral-secondary">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {jadwalHariIni.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-neutral-light/20 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-neutral-light" />
          </div>
          <p className="text-neutral-secondary">
            Tidak ada jadwal mengajar untuk hari ini
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {jadwalHariIni.map((jadwal, index) => (
            <motion.div
              key={jadwal._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 rounded-xl border transition-all ${
                isJadwalAktif(jadwal._id)
                  ? "bg-primary/5 border-primary shadow-md"
                  : "bg-neutral-light/5 border-neutral-border hover:border-primary/30"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-neutral-text">
                      {jadwal.kelas?.nama || "Kelas Tidak Diketahui"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-secondary">
                    <BookOpen className="w-4 h-4" />
                    <span>
                      {jadwal.mataPelajaran?.nama || "Mata Pelajaran"}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm font-medium text-primary">
                    <Clock className="w-4 h-4" />
                    <span>
                      {formatTime(jadwal.jamMulai)} -{" "}
                      {formatTime(jadwal.jamSelesai)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onMulaiSesi(jadwal)}
                disabled={
                  isGeneratingQR ||
                  isJadwalAktif(jadwal._id) ||
                  (sesiAktif && !isJadwalAktif(jadwal._id))
                }
                className={`w-full py-2.5 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  isJadwalAktif(jadwal._id)
                    ? "bg-success text-white cursor-not-allowed"
                    : sesiAktif
                    ? "bg-neutral-light/20 text-neutral-tertiary cursor-not-allowed"
                    : "bg-gradient-to-r from-primary to-primary-dark text-white hover:shadow-lg"
                }`}
              >
                {isGeneratingQR ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Membuat QR Code...</span>
                  </>
                ) : isJadwalAktif(jadwal._id) ? (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Sesi Sedang Berlangsung</span>
                  </>
                ) : sesiAktif ? (
                  <span>Sesi Lain Aktif</span>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Mulai Sesi Presensi</span>
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  );
}
