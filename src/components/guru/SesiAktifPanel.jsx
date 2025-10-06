// src/components/guru/SesiAktifPanel.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  QrCode,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  BookOpen,
  Users,
} from "lucide-react";
import Card from "@/components/ui/Card";
import { showToast } from "@/lib/toast";

export default function SesiAktifPanel({ sesiAktif, onAkhiriSesi }) {
  const [timeRemaining, setTimeRemaining] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!sesiAktif?.expiredAt) return;

    const updateTimer = () => {
      const now = new Date();
      const expired = new Date(sesiAktif.expiredAt);
      const diff = expired - now;

      if (diff <= 0) {
        setTimeRemaining("Sesi berakhir");
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [sesiAktif]);

  const handleCopyKode = () => {
    if (sesiAktif?.kodeUnik) {
      navigator.clipboard.writeText(sesiAktif.kodeUnik);
      setIsCopied(true);
      showToast.success("Kode sesi berhasil disalin!");
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleAkhiriSesi = () => {
    if (window.confirm("Yakin ingin mengakhiri sesi presensi?")) {
      onAkhiriSesi();
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success to-success-dark flex items-center justify-center">
            <QrCode className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-text">Sesi Aktif</h2>
            <p className="text-sm text-neutral-secondary">
              Sesi akan berakhir dalam{" "}
              <span className="font-semibold text-warning">
                {timeRemaining}
              </span>
            </p>
          </div>
        </div>
        <button
          onClick={handleAkhiriSesi}
          className="px-4 py-2 bg-error/10 hover:bg-error/20 text-error rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <XCircle className="w-4 h-4" />
          <span>Akhiri Sesi</span>
        </button>
      </div>

      {/* Info Kelas */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 bg-neutral-light/5 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm text-neutral-secondary">Kelas</span>
          </div>
          <p className="font-semibold text-neutral-text">
            {sesiAktif?.namaKelas}
          </p>
        </div>
        <div className="p-3 bg-neutral-light/5 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-sm text-neutral-secondary">
              Mata Pelajaran
            </span>
          </div>
          <p className="font-semibold text-neutral-text">
            {sesiAktif?.namaMapel}
          </p>
        </div>
      </div>

      {/* QR Code */}
      <div className="bg-gradient-to-br from-neutral-light/10 to-neutral-light/5 p-6 rounded-xl mb-6">
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-4 rounded-2xl shadow-lg mb-4"
          >
            <img
              src={sesiAktif?.qrCode}
              alt="QR Code Presensi"
              className="w-64 h-64 object-contain"
            />
          </motion.div>

          {/* Kode Unik */}
          <div className="w-full">
            <p className="text-sm text-neutral-secondary text-center mb-2">
              Kode Sesi Presensi
            </p>
            <div className="flex items-center gap-2 bg-white p-4 rounded-xl shadow-sm">
              <div className="flex-1 text-center">
                <p className="text-3xl font-bold text-primary tracking-wider">
                  {sesiAktif?.kodeUnik}
                </p>
              </div>
              <button
                onClick={handleCopyKode}
                className={`p-3 rounded-lg transition-all ${
                  isCopied
                    ? "bg-success text-white"
                    : "bg-neutral-light/20 hover:bg-neutral-light/30 text-neutral-text"
                }`}
              >
                {isCopied ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Info Lokasi dan Waktu */}
      <div className="space-y-3">
        <div className="flex items-start gap-3 p-3 bg-info/5 rounded-lg">
          <Clock className="w-5 h-5 text-info mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-neutral-text mb-1">
              Waktu Mengajar
            </p>
            <p className="text-sm text-neutral-secondary">
              {sesiAktif?.jamMulai?.substring(0, 5)} -{" "}
              {sesiAktif?.jamSelesai?.substring(0, 5)}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-success/5 rounded-lg">
          <MapPin className="w-5 h-5 text-success mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-neutral-text mb-1">
              Lokasi Sesi
            </p>
            <p className="text-xs text-neutral-secondary">
              {sesiAktif?.latitude?.toFixed(6)},{" "}
              {sesiAktif?.longitude?.toFixed(6)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
