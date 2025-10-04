// src/app/(dashboard)/guru/kelas/page.js
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  Calendar,
  Clock,
  ChevronRight,
  Loader2,
  GraduationCap,
  Filter,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import { guruService } from "@/services/guru.service";
import { showToast } from "@/lib/toast";

// Komponen KelasCard
const KelasCard = ({ jadwal, index }) => {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => router.push(`/guru/kelas/${jadwal.kelas._id}`)}
      className="cursor-pointer group"
    >
      <Card className="hover:shadow-hover transition-all">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-darkest flex items-center justify-center shadow-md">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-text group-hover:text-primary transition-colors">
                  {jadwal.kelas.nama}
                </h3>
                <p className="text-sm text-neutral-secondary">
                  Tingkat {jadwal.kelas.tingkat} • {jadwal.kelas.jurusan}
                </p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-neutral-secondary">
                <BookOpen className="w-4 h-4" />
                <span>{jadwal.mataPelajaran.nama}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-secondary">
                <Calendar className="w-4 h-4" />
                <span className="capitalize">{jadwal.hari}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-secondary">
                <Clock className="w-4 h-4" />
                <span>
                  {jadwal.jamMulai} - {jadwal.jamSelesai}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-success/10 text-success rounded-full text-xs font-medium">
                Aktif
              </div>
              <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                {jadwal.kelas.tingkat === 10
                  ? "Kelas X"
                  : jadwal.kelas.tingkat === 11
                  ? "Kelas XI"
                  : "Kelas XII"}
              </div>
            </div>
          </div>

          <ChevronRight className="w-5 h-5 text-neutral-tertiary group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
      </Card>
    </motion.div>
  );
};

// Main Component
export default function ManajemenKelasPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [jadwalGuru, setJadwalGuru] = useState([]);
  const [filteredJadwal, setFilteredJadwal] = useState([]);
  const [filterTingkat, setFilterTingkat] = useState("semua");
  const [stats, setStats] = useState({
    totalKelas: 0,
    totalMataPelajaran: 0,
    kelasAktif: 0,
  });

  useEffect(() => {
    fetchJadwalGuru();
  }, []);

  useEffect(() => {
    if (filterTingkat === "semua") {
      setFilteredJadwal(jadwalGuru);
    } else {
      const filtered = jadwalGuru.filter(
        (j) => j.kelas.tingkat === parseInt(filterTingkat)
      );
      setFilteredJadwal(filtered);
    }
  }, [filterTingkat, jadwalGuru]);

  const fetchJadwalGuru = async () => {
    try {
      setIsLoading(true);
      const response = await guruService.getJadwalGuru();

      if (response) {
        // Gabungkan semua jadwal dari semua hari
        const allJadwal = Object.values(response).flat();

        // Hilangkan duplikat kelas (ambil satu jadwal per kelas)
        const uniqueKelas = new Map();
        allJadwal.forEach((jadwal) => {
          if (!uniqueKelas.has(jadwal.kelas._id)) {
            uniqueKelas.set(jadwal.kelas._id, jadwal);
          }
        });

        const uniqueJadwal = Array.from(uniqueKelas.values());
        setJadwalGuru(uniqueJadwal);
        setFilteredJadwal(uniqueJadwal);

        // Hitung statistik
        const uniqueMataPelajaran = new Set(
          allJadwal.map((j) => j.mataPelajaran._id)
        );

        setStats({
          totalKelas: uniqueJadwal.length,
          totalMataPelajaran: uniqueMataPelajaran.size,
          kelasAktif: uniqueJadwal.filter((j) => j.isActive).length,
        });
      } else {
        showToast.error("Gagal memuat data kelas");
      }
    } catch (error) {
      console.error("Error fetching jadwal:", error);
      showToast.error("Gagal memuat data kelas. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
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
        <h1 className="text-3xl font-bold text-neutral-text mb-2">
          Daftar Kelas
        </h1>
        <p className="text-neutral-secondary">
          Kelola dan pantau kelas yang Anda ampu
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <Card className="hover:shadow-hover transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-neutral-secondary mb-1">Total Kelas</p>
              <p className="text-3xl font-bold text-neutral-text">
                {stats.totalKelas}
              </p>
              <p className="text-xs text-neutral-tertiary mt-1">
                Kelas yang diampu
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-darkest flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-hover transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-neutral-secondary mb-1">
                Mata Pelajaran
              </p>
              <p className="text-3xl font-bold text-neutral-text">
                {stats.totalMataPelajaran}
              </p>
              <p className="text-xs text-neutral-tertiary mt-1">
                Mapel yang diajar
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success to-success-dark flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-hover transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-neutral-secondary mb-1">Kelas Aktif</p>
              <p className="text-3xl font-bold text-neutral-text">
                {stats.kelasAktif}
              </p>
              <p className="text-xs text-neutral-tertiary mt-1">
                Sedang berjalan
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-info to-info-dark flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <Card>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-neutral-secondary" />
              <span className="text-sm font-medium text-neutral-text">
                Filter Tingkat:
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterTingkat("semua")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterTingkat === "semua"
                    ? "bg-primary text-white"
                    : "bg-neutral-light/20 text-neutral-secondary hover:bg-neutral-light/30"
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterTingkat("10")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterTingkat === "10"
                    ? "bg-primary text-white"
                    : "bg-neutral-light/20 text-neutral-secondary hover:bg-neutral-light/30"
                }`}
              >
                Kelas X
              </button>
              <button
                onClick={() => setFilterTingkat("11")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterTingkat === "11"
                    ? "bg-primary text-white"
                    : "bg-neutral-light/20 text-neutral-secondary hover:bg-neutral-light/30"
                }`}
              >
                Kelas XI
              </button>
              <button
                onClick={() => setFilterTingkat("12")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterTingkat === "12"
                    ? "bg-primary text-white"
                    : "bg-neutral-light/20 text-neutral-secondary hover:bg-neutral-light/30"
                }`}
              >
                Kelas XII
              </button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Daftar Kelas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-neutral-text">Daftar Kelas</h2>
          <span className="text-sm text-neutral-secondary">
            {filteredJadwal.length} kelas
          </span>
        </div>

        {filteredJadwal.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJadwal.map((jadwal, index) => (
              <KelasCard key={jadwal._id} jadwal={jadwal} index={index} />
            ))}
          </div>
        ) : (
          <Card>
            <div className="text-center py-12">
              <GraduationCap className="w-16 h-16 mx-auto mb-4 text-neutral-light" />
              <p className="text-neutral-secondary mb-2">
                Tidak ada kelas yang sesuai dengan filter
              </p>
              <button
                onClick={() => setFilterTingkat("semua")}
                className="text-sm text-primary hover:text-primary-dark"
              >
                Reset filter
              </button>
            </div>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
