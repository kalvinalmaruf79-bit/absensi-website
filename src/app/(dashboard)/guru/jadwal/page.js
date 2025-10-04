// src/app/(dashboard)/guru/jadwal/page.js
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  BookOpen,
  Users,
  RefreshCw,
  Loader2,
  Filter,
} from "lucide-react";
import Card from "@/components/ui/Card";
import { guruService } from "@/services/guru.service";
import { showToast } from "@/lib/toast";

// Komponen JadwalCard untuk setiap jadwal
const JadwalCard = ({ jadwal }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="bg-white border border-neutral-border rounded-lg p-4 hover:shadow-hover transition-all"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#00a3d4] to-[#005f8b] flex items-center justify-center shadow-md flex-shrink-0">
          <BookOpen className="w-6 h-6 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-neutral-text text-lg mb-1">
            {jadwal.mataPelajaran?.nama || "Mata Pelajaran"}
          </h3>
          <div className="flex items-center gap-2 text-sm text-neutral-secondary mb-2">
            <Users className="w-4 h-4" />
            <span>
              {jadwal.kelas?.nama || "Kelas"}
              {jadwal.kelas?.tingkat && ` - ${jadwal.kelas.tingkat}`}
              {jadwal.kelas?.jurusan && ` ${jadwal.kelas.jurusan}`}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-tertiary">
            <Clock className="w-4 h-4" />
            <span>
              {jadwal.jamMulai} - {jadwal.jamSelesai}
            </span>
          </div>
        </div>

        {/* Badge Waktu */}
        <div className="text-right">
          <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
            {jadwal.jamMulai}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Komponen untuk menampilkan jadwal per hari
const HariSection = ({ hari, jadwalList }) => {
  const namaHari = {
    senin: "Senin",
    selasa: "Selasa",
    rabu: "Rabu",
    kamis: "Kamis",
    jumat: "Jumat",
    sabtu: "Sabtu",
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-2 h-8 bg-gradient-to-b from-[#00a3d4] to-[#005f8b] rounded-full"></div>
        <h2 className="text-xl font-bold text-neutral-text">
          {namaHari[hari]}
        </h2>
        <span className="text-sm text-neutral-secondary">
          ({jadwalList.length} sesi)
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jadwalList.length > 0 ? (
          jadwalList.map((jadwal, index) => (
            <JadwalCard key={jadwal._id || index} jadwal={jadwal} />
          ))
        ) : (
          <div className="col-span-2 text-center py-8 text-neutral-secondary bg-neutral-light/5 rounded-lg">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Tidak ada jadwal mengajar pada hari ini</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Fungsi untuk generate tahun ajaran otomatis
const generateTahunAjaranOptions = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-11

  // Jika bulan Juli (6) atau lebih, tahun ajaran baru sudah dimulai
  const startYear = currentMonth >= 6 ? currentYear : currentYear - 1;

  const years = [];
  // Generate 3 tahun ke belakang dan 3 tahun ke depan dari tahun ajaran aktif
  for (let i = -3; i <= 3; i++) {
    const year = startYear + i;
    years.push(`${year}/${year + 1}`);
  }

  return years.reverse();
};

// Fungsi untuk mendapatkan tahun ajaran dan semester aktif
const getActivePeriod = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-11

  let tahunAjaran, semester;

  // Juli-Desember = Semester Ganjil (tahun ajaran dimulai)
  if (currentMonth >= 6 && currentMonth <= 11) {
    tahunAjaran = `${currentYear}/${currentYear + 1}`;
    semester = "ganjil";
  }
  // Januari-Juni = Semester Genap (masih tahun ajaran sebelumnya)
  else {
    tahunAjaran = `${currentYear - 1}/${currentYear}`;
    semester = "genap";
  }

  return { tahunAjaran, semester };
};

// Main Component
export default function JadwalMengajarPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [jadwalData, setJadwalData] = useState({
    senin: [],
    selasa: [],
    rabu: [],
    kamis: [],
    jumat: [],
    sabtu: [],
  });

  const [filters, setFilters] = useState({
    tahunAjaran: "",
    semester: "",
  });

  const [tahunAjaranOptions, setTahunAjaranOptions] = useState([]);

  useEffect(() => {
    // Generate tahun ajaran options
    const years = generateTahunAjaranOptions();
    setTahunAjaranOptions(years);

    // Set default filter ke periode aktif
    const activePeriod = getActivePeriod();
    setFilters({
      tahunAjaran: activePeriod.tahunAjaran,
      semester: activePeriod.semester,
    });
  }, []);

  useEffect(() => {
    // Fetch jadwal ketika filter berubah dan sudah ada nilai
    if (filters.tahunAjaran && filters.semester) {
      fetchJadwal();
    }
  }, [filters]);

  const fetchJadwal = async () => {
    try {
      setIsLoading(true);
      const response = await guruService.getJadwal(filters);

      // Backend mengembalikan langsung object dengan key hari
      if (response && typeof response === "object") {
        setJadwalData(response);
      } else {
        showToast.error("Format data jadwal tidak valid");
        setJadwalData({
          senin: [],
          selasa: [],
          rabu: [],
          kamis: [],
          jumat: [],
          sabtu: [],
        });
      }
    } catch (error) {
      console.error("Error fetching jadwal:", error);
      showToast.error(
        error.response?.data?.message ||
          "Gagal memuat jadwal. Silakan coba lagi."
      );
      // Set empty data jika error
      setJadwalData({
        senin: [],
        selasa: [],
        rabu: [],
        kamis: [],
        jumat: [],
        sabtu: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const getTotalJadwal = () => {
    return Object.values(jadwalData).reduce(
      (total, hari) => total + hari.length,
      0
    );
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00a3d4] to-[#005f8b] flex items-center justify-center shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-text">
                Jadwal Mengajar
              </h1>
              <p className="text-neutral-secondary mt-1">
                Total {getTotalJadwal()} sesi mengajar per minggu
              </p>
            </div>
          </div>
          <button
            onClick={fetchJadwal}
            disabled={isLoading}
            className="px-4 py-2 border border-neutral-border text-neutral-text rounded-lg hover:bg-neutral-surface transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-neutral-secondary" />
            <h3 className="text-lg font-semibold text-neutral-text">
              Filter Jadwal
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Tahun Ajaran
              </label>
              <select
                value={filters.tahunAjaran}
                onChange={(e) =>
                  handleFilterChange("tahunAjaran", e.target.value)
                }
                className="w-full px-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              >
                {tahunAjaranOptions.map((ta) => (
                  <option key={ta} value={ta}>
                    {ta}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Semester
              </label>
              <select
                value={filters.semester}
                onChange={(e) => handleFilterChange("semester", e.target.value)}
                className="w-full px-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              >
                <option value="ganjil">Ganjil</option>
                <option value="genap">Genap</option>
              </select>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Jadwal Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(jadwalData).map(([hari, jadwalList]) => (
              <HariSection key={hari} hari={hari} jadwalList={jadwalList} />
            ))}
          </div>
        )}
      </motion.div>

      {/* Summary Card */}
      {!isLoading && getTotalJadwal() > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#00a3d4] to-[#005f8b] flex items-center justify-center shadow-lg">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-text mb-1">
                    Ringkasan Jadwal
                  </h3>
                  <p className="text-sm text-neutral-secondary">
                    Semester{" "}
                    {filters.semester.charAt(0).toUpperCase() +
                      filters.semester.slice(1)}{" "}
                    • Tahun Ajaran {filters.tahunAjaran}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-primary">
                  {getTotalJadwal()}
                </p>
                <p className="text-sm text-neutral-secondary">
                  Sesi per minggu
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && getTotalJadwal() === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <Card className="text-center py-16">
            <Calendar className="w-20 h-20 mx-auto mb-4 text-neutral-secondary opacity-50" />
            <h3 className="text-xl font-bold text-neutral-text mb-2">
              Tidak Ada Jadwal
            </h3>
            <p className="text-neutral-secondary mb-4">
              Tidak ada jadwal mengajar untuk periode {filters.semester} tahun
              ajaran {filters.tahunAjaran}
            </p>
            <p className="text-sm text-neutral-tertiary">
              Silakan hubungi admin jika Anda merasa ini adalah kesalahan
            </p>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
