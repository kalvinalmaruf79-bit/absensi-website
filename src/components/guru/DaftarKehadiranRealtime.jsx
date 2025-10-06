// src/components/guru/DaftarKehadiranRealtime.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileHeart,
  Loader2,
  RefreshCw,
} from "lucide-react";
import Card from "@/components/ui/Card";
import { guruService } from "@/services/guru.service";
import { absensiService } from "@/services/absensi.service";
import { showToast } from "@/lib/toast";

export default function DaftarKehadiranRealtime({ sesiAktif }) {
  const [daftarSiswa, setDaftarSiswa] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    hadir: 0,
    izin: 0,
    sakit: 0,
    alpa: 0,
  });

  useEffect(() => {
    if (sesiAktif) {
      fetchDaftarKehadiran();
      const interval = setInterval(fetchDaftarKehadiran, 15000); // Refresh setiap 15 detik
      return () => clearInterval(interval);
    }
  }, [sesiAktif]);

  const fetchDaftarKehadiran = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) setIsRefreshing(true);
      else setIsLoading(true);

      const tanggal = new Date().toISOString().split("T")[0];
      const response = await guruService.getAbsensiBySesi({
        kelasId: sesiAktif.kelasId,
        mataPelajaranId: sesiAktif.mataPelajaranId,
        tanggal: tanggal,
      });

      setDaftarSiswa(response);
      calculateStats(response);
    } catch (error) {
      console.error("Error fetching kehadiran:", error);
      if (!showRefreshIndicator) {
        showToast.error("Gagal memuat daftar kehadiran");
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const calculateStats = (data) => {
    const newStats = { hadir: 0, izin: 0, sakit: 0, alpa: 0 };
    data.forEach((item) => {
      if (newStats.hasOwnProperty(item.keterangan)) {
        newStats[item.keterangan]++;
      }
    });
    setStats(newStats);
  };

  const handleManualRefresh = () => {
    fetchDaftarKehadiran(true);
  };

  const handleUpdateStatus = async (siswaId, absensiId, newStatus) => {
    try {
      if (absensiId) {
        // Jika sudah ada record absensi, update
        await absensiService.updateKeterangan(absensiId, newStatus);
        showToast.success(`Status berhasil diubah menjadi ${newStatus}`);
      } else {
        // Jika belum ada record, buat manual entry
        // Perlu endpoint baru di backend untuk create manual
        await absensiService.createManualAbsensi({
          siswaId,
          jadwalId: sesiAktif.jadwalId,
          keterangan: newStatus,
          tanggal: new Date().toISOString().split("T")[0],
        });
        showToast.success(`Status ${newStatus} berhasil ditambahkan`);
      }
      fetchDaftarKehadiran(true);
    } catch (error) {
      console.error("Error updating status:", error);
      showToast.error("Gagal mengubah status siswa");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "hadir":
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case "izin":
        return <FileHeart className="w-5 h-5 text-info" />;
      case "sakit":
        return <AlertCircle className="w-5 h-5 text-warning" />;
      case "alpa":
        return <XCircle className="w-5 h-5 text-error" />;
      default:
        return <XCircle className="w-5 h-5 text-neutral-light" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "hadir":
        return "bg-success/10 text-success border-success/20";
      case "izin":
        return "bg-info/10 text-info border-info/20";
      case "sakit":
        return "bg-warning/10 text-warning border-warning/20";
      case "alpa":
        return "bg-error/10 text-error border-error/20";
      default:
        return "bg-neutral-light/10 text-neutral-tertiary border-neutral-border";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-xl font-bold text-neutral-text">
              Daftar Kehadiran
            </h2>
            <p className="text-sm text-neutral-secondary">
              Total {daftarSiswa.length} siswa
            </p>
          </div>
        </div>
        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-lg bg-neutral-light/10 hover:bg-neutral-light/20 transition-colors disabled:opacity-50"
          title="Refresh manual"
        >
          <RefreshCw
            className={`w-5 h-5 text-primary ${
              isRefreshing ? "animate-spin" : ""
            }`}
          />
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="p-3 bg-success/5 rounded-lg text-center">
          <p className="text-2xl font-bold text-success">{stats.hadir}</p>
          <p className="text-xs text-neutral-secondary">Hadir</p>
        </div>
        <div className="p-3 bg-info/5 rounded-lg text-center">
          <p className="text-2xl font-bold text-info">{stats.izin}</p>
          <p className="text-xs text-neutral-secondary">Izin</p>
        </div>
        <div className="p-3 bg-warning/5 rounded-lg text-center">
          <p className="text-2xl font-bold text-warning">{stats.sakit}</p>
          <p className="text-xs text-neutral-secondary">Sakit</p>
        </div>
        <div className="p-3 bg-error/5 rounded-lg text-center">
          <p className="text-2xl font-bold text-error">{stats.alpa}</p>
          <p className="text-xs text-neutral-secondary">Alpa</p>
        </div>
      </div>

      {/* Daftar Siswa */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
        {daftarSiswa.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto mb-3 text-neutral-light" />
            <p className="text-neutral-secondary">
              Tidak ada data siswa di kelas ini
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {daftarSiswa.map((item, index) => (
              <motion.div
                key={item.siswa._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className={`p-4 rounded-lg border transition-all ${
                  item.keterangan === "hadir"
                    ? "bg-success/5 border-success/20"
                    : "bg-neutral-light/5 border-neutral-border"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-shrink-0">
                      {getStatusIcon(item.keterangan)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-text truncate">
                        {item.siswa.name}
                      </p>
                      <p className="text-sm text-neutral-secondary">
                        {item.siswa.identifier}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(
                        item.keterangan
                      )}`}
                    >
                      {item.keterangan.charAt(0).toUpperCase() +
                        item.keterangan.slice(1)}
                    </span>

                    {/* Dropdown untuk ubah status */}
                    <select
                      value={item.keterangan}
                      onChange={(e) =>
                        handleUpdateStatus(
                          item.siswa._id,
                          item._id,
                          e.target.value
                        )
                      }
                      className="px-2 py-1 text-xs bg-neutral-light/10 border border-neutral-border rounded-lg outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="hadir">Hadir</option>
                      <option value="izin">Izin</option>
                      <option value="sakit">Sakit</option>
                      <option value="alpa">Alpa</option>
                    </select>
                  </div>
                </div>

                {/* Waktu check-in jika hadir */}
                {item.keterangan === "hadir" && item.waktuMasuk && (
                  <div className="mt-2 pt-2 border-t border-neutral-border/50">
                    <p className="text-xs text-neutral-secondary">
                      Check-in:{" "}
                      {new Date(item.waktuMasuk).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </Card>
  );
}
