// src/app/(dashboard)/guru/kelas/presensi/page.js
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, QrCode, Users, Clock } from "lucide-react";
import Card from "@/components/ui/Card";
import { guruService } from "@/services/guru.service";
import { qrService } from "@/services/qr.service";
import { showToast } from "@/lib/toast";
import JadwalList from "@/components/guru/JadwalList";
import SesiAktifPanel from "@/components/guru/SesiAktifPanel";
import DaftarKehadiranRealtime from "@/components/guru/DaftarKehadiranRealtime";

export default function PresensiPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [jadwalHariIni, setJadwalHariIni] = useState([]);
  const [sesiAktif, setSesiAktif] = useState(null);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  useEffect(() => {
    initializePage();
  }, []);

  // PERUBAHAN UTAMA: Fungsi untuk initialize page dengan cek sesi aktif
  const initializePage = async () => {
    try {
      setIsLoading(true);

      // 1. Fetch jadwal hari ini
      const hariMap = {
        0: "minggu",
        1: "senin",
        2: "selasa",
        3: "rabu",
        4: "kamis",
        5: "jumat",
        6: "sabtu",
      };
      const hariIni = hariMap[new Date().getDay()];

      const allJadwal = await guruService.getJadwalGuru();
      const jadwalToday = allJadwal[hariIni] || [];
      setJadwalHariIni(jadwalToday);

      // 2. Cek apakah ada sesi aktif
      await checkActiveSessions(jadwalToday);
    } catch (error) {
      console.error("Error initializing page:", error);
      showToast.error("Gagal memuat data halaman");
    } finally {
      setIsLoading(false);
    }
  };

  // FUNGSI BARU: Cek sesi aktif yang sedang berjalan
  const checkActiveSessions = async (jadwalList) => {
    try {
      const activeSessions = await qrService.checkActiveSessions();

      if (activeSessions && activeSessions.length > 0) {
        // Ambil sesi pertama yang aktif
        const sesi = activeSessions[0];

        // Cari jadwal yang sesuai
        const matchedJadwal = jadwalList.find((j) => j._id === sesi.jadwal._id);

        if (matchedJadwal) {
          // Recreate QR Code dari sesi yang ada
          const qrData = {
            KODE_SESI: sesi.kodeUnik,
            MATA_PELAJARAN: sesi.jadwal.mataPelajaran.nama,
            KELAS: sesi.jadwal.kelas.nama,
            TANGGAL: sesi.tanggal,
            EXPIRED: sesi.expiredAt,
          };

          // Generate QR Code lagi (atau bisa simpan di backend)
          const QRCode = require("qrcode");
          const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData));

          setSesiAktif({
            qrCode: qrCodeDataURL,
            kodeUnik: sesi.kodeUnik,
            expiredAt: sesi.expiredAt,
            jadwalId: sesi.jadwal._id,
            kelasId: sesi.jadwal.kelas._id,
            mataPelajaranId: sesi.jadwal.mataPelajaran._id,
            namaKelas: sesi.jadwal.kelas.nama,
            namaMapel: sesi.jadwal.mataPelajaran.nama,
            jamMulai: matchedJadwal.jamMulai,
            jamSelesai: matchedJadwal.jamSelesai,
            latitude: sesi.lokasi.latitude,
            longitude: sesi.lokasi.longitude,
          });

          showToast.info("Sesi presensi yang sedang berlangsung telah dimuat");
        }
      }
    } catch (error) {
      console.error("Error checking active sessions:", error);
      // Silent fail, tidak perlu toast karena ini bukan error kritis
    }
  };

  const handleMulaiSesi = async (jadwal) => {
    if (isGeneratingQR) return;

    setIsGeneratingQR(true);

    try {
      // Dapatkan lokasi dari browser
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const { latitude, longitude } = position.coords;

      // Generate QR Code
      const response = await qrService.generateQR({
        jadwalId: jadwal._id,
        latitude,
        longitude,
      });

      // Set sesi aktif dengan data lengkap
      setSesiAktif({
        ...response,
        jadwalId: jadwal._id,
        kelasId: jadwal.kelas._id,
        mataPelajaranId: jadwal.mataPelajaran._id,
        namaKelas: jadwal.kelas.nama,
        namaMapel: jadwal.mataPelajaran.nama,
        jamMulai: jadwal.jamMulai,
        jamSelesai: jadwal.jamSelesai,
        latitude,
        longitude,
      });

      // PERUBAHAN: Pesan yang lebih informatif
      if (response.isExisting) {
        showToast.info("Sesi presensi yang sudah aktif berhasil dimuat!");
      } else {
        showToast.success("Sesi presensi berhasil dimulai!");
      }
    } catch (error) {
      console.error("Error memulai sesi:", error);
      if (error.code === 1) {
        showToast.error("Akses lokasi ditolak. Mohon izinkan akses lokasi.");
      } else if (error.response?.data?.message) {
        showToast.error(error.response.data.message);
      } else {
        showToast.error("Gagal memulai sesi presensi");
      }
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const handleAkhiriSesi = () => {
    setSesiAktif(null);
    showToast.success("Sesi presensi telah diakhiri");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-darkest flex items-center justify-center">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-text">
              Presensi Kelas
            </h1>
            <p className="text-neutral-secondary">
              Kelola sesi presensi dengan QR Code
            </p>
          </div>
        </div>
      </motion.div>

      {/* Info Banner */}
      {!sesiAktif && jadwalHariIni.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-r from-info/10 to-info/5 border-info/20">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-info" />
              <div>
                <p className="font-semibold text-neutral-text mb-1">
                  Tidak ada jadwal mengajar hari ini
                </p>
                <p className="text-sm text-neutral-secondary">
                  Anda tidak memiliki jadwal mengajar untuk hari ini.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Main Content - Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel Kiri: Jadwal Hari Ini */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <JadwalList
            jadwalHariIni={jadwalHariIni}
            sesiAktif={sesiAktif}
            onMulaiSesi={handleMulaiSesi}
            isGeneratingQR={isGeneratingQR}
          />
        </motion.div>

        {/* Panel Kanan: Sesi Aktif / Placeholder */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <AnimatePresence mode="wait">
            {sesiAktif ? (
              <motion.div
                key="sesi-aktif"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                <SesiAktifPanel
                  sesiAktif={sesiAktif}
                  onAkhiriSesi={handleAkhiriSesi}
                />
                <DaftarKehadiranRealtime sesiAktif={sesiAktif} />
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="h-full min-h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-neutral-light/20 flex items-center justify-center mx-auto mb-4">
                      <Users className="w-10 h-10 text-neutral-light" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-text mb-2">
                      Belum Ada Sesi Aktif
                    </h3>
                    <p className="text-sm text-neutral-secondary max-w-sm">
                      Pilih jadwal mengajar di sebelah kiri untuk memulai sesi
                      presensi
                    </p>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
