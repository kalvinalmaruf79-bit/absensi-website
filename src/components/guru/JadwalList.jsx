// components/guru/JadwalList.jsx
import { motion } from "framer-motion";
import { Clock, BookOpen, Users, Play, Loader2, UserPlus } from "lucide-react";
import Card from "@/components/ui/Card";

export default function JadwalList({
  jadwalHariIni,
  sesiAktif,
  onMulaiSesi,
  onAbsenManual,
  isGeneratingQR,
}) {
  if (jadwalHariIni.length === 0) {
    return (
      <Card className="h-full min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-neutral-light/20 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-10 h-10 text-neutral-light" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-text mb-2">
            Tidak Ada Jadwal Hari Ini
          </h3>
          <p className="text-sm text-neutral-secondary max-w-sm">
            Anda tidak memiliki jadwal mengajar untuk hari ini
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Clock className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-neutral-text">
            Jadwal Mengajar Hari Ini
          </h2>
          <p className="text-sm text-neutral-secondary">
            Senin, 13 Oktober 2025
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {jadwalHariIni.map((jadwal, index) => {
          const isActive = sesiAktif?.jadwalId === jadwal._id;

          return (
            <motion.div
              key={jadwal._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border-2 transition-all ${
                isActive
                  ? "border-primary bg-primary/5"
                  : "border-neutral-border hover:border-neutral-light"
              }`}
            >
              {/* Header Jadwal */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-text">
                      {jadwal.kelas?.nama || "Kelas"}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-neutral-secondary">
                      <Clock className="w-4 h-4" />
                      <span>
                        {jadwal.jamMulai} - {jadwal.jamSelesai}
                      </span>
                    </div>
                  </div>
                </div>

                {isActive && (
                  <span className="px-3 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
                    Sesi Aktif
                  </span>
                )}
              </div>

              {/* Mata Pelajaran */}
              <div className="flex items-center gap-2 mb-4 pl-13">
                <BookOpen className="w-4 h-4 text-neutral-secondary" />
                <span className="text-sm text-neutral-text">
                  {jadwal.mataPelajaran?.nama || "Mata Pelajaran"}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pl-13">
                <button
                  onClick={() => onMulaiSesi(jadwal)}
                  disabled={isActive || isGeneratingQR}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    isActive
                      ? "bg-neutral-light text-neutral-secondary cursor-not-allowed"
                      : "bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/25"
                  }`}
                >
                  {isGeneratingQR ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Mulai Sesi Presensi</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onAbsenManual(jadwal)}
                  className="px-4 py-2.5 rounded-lg border-2 border-neutral-border hover:border-primary hover:bg-primary/5 font-medium text-neutral-text hover:text-primary transition-all flex items-center justify-center gap-2"
                  title="Absen Manual"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Absen Manual</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
