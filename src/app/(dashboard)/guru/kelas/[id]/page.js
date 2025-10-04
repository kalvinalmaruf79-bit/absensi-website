// src/app/(dashboard)/guru/kelas/[id]/page.js
"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Loader2,
  BookOpen,
  GraduationCap,
  ArrowLeft,
  Mail,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import { guruService } from "@/services/guru.service";
import { showToast } from "@/lib/toast";

// Komponen Card Siswa
const SiswaCard = ({ siswa, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="flex items-center gap-4 p-4 bg-neutral-light/5 hover:bg-neutral-light/10 rounded-xl transition-all"
    >
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-darkest flex items-center justify-center text-white font-semibold shadow-md">
        {siswa.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-neutral-text">{siswa.name}</h3>
        <p className="text-sm text-neutral-secondary">
          NIS: {siswa.identifier}
        </p>
        {siswa.email && (
          <div className="flex items-center gap-1 text-xs text-neutral-tertiary mt-1">
            <Mail className="w-3 h-3" />
            <span>{siswa.email}</span>
          </div>
        )}
      </div>
      <div className="px-3 py-1 bg-success/10 text-success rounded-full text-xs font-medium">
        Aktif
      </div>
    </motion.div>
  );
};

export default function DetailKelasPage({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [siswaList, setSiswaList] = useState([]);
  const [filteredSiswa, setFilteredSiswa] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [kelasInfo, setKelasInfo] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalDocs: 0,
  });

  useEffect(() => {
    if (resolvedParams.id) {
      fetchSiswaKelas();
    }
  }, [resolvedParams.id]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSiswa(siswaList);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = siswaList.filter(
        (siswa) =>
          siswa.name.toLowerCase().includes(query) ||
          siswa.identifier.toLowerCase().includes(query)
      );
      setFilteredSiswa(filtered);
    }
  }, [searchQuery, siswaList]);

  const fetchSiswaKelas = async () => {
    try {
      setIsLoading(true);
      // PENTING: Gunakan resolvedParams.id (dari [id] di path)
      const response = await guruService.getSiswaKelas(resolvedParams.id, {
        limit: 100,
      });

      console.log("Response getSiswaKelas:", response); // Debug log

      if (response.success !== false) {
        const siswaData = response.docs || [];
        setSiswaList(siswaData);
        setFilteredSiswa(siswaData);
        setPagination({
          currentPage: response.page || 1,
          totalPages: response.totalPages || 1,
          totalDocs: response.totalDocs || 0,
        });

        // Ambil info kelas dari siswa pertama
        if (siswaData.length > 0) {
          const firstSiswa = siswaData[0];
          console.log("First Siswa Data:", firstSiswa); // Debug log
          console.log("Kelas Info:", firstSiswa.kelas); // Debug log

          if (firstSiswa.kelas) {
            setKelasInfo(firstSiswa.kelas);
          } else {
            // Jika kelas tidak ter-populate, ambil langsung dari ID
            console.warn("Kelas tidak ter-populate, mencoba fetch manual");
            // Fallback: bisa tambahkan fetch kelas by ID jika diperlukan
          }
        }
      } else {
        showToast.error(response.message || "Gagal memuat data siswa");
      }
    } catch (error) {
      console.error("Error fetching siswa:", error);
      showToast.error("Gagal memuat data siswa. Silakan coba lagi.");
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
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-neutral-secondary hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali ke Daftar Kelas</span>
        </button>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-text mb-2">
              {kelasInfo?.nama || "Detail Kelas"}
            </h1>
            <div className="flex items-center gap-4 text-sm text-neutral-secondary">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                <span>
                  Tingkat {kelasInfo?.tingkat || "-"} •{" "}
                  {kelasInfo?.jurusan || "-"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{pagination.totalDocs} Siswa</span>
              </div>
            </div>
          </div>
        </div>
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
              <p className="text-sm text-neutral-secondary mb-1">Total Siswa</p>
              <p className="text-3xl font-bold text-neutral-text">
                {pagination.totalDocs}
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
                Hasil Pencarian
              </p>
              <p className="text-3xl font-bold text-neutral-text">
                {filteredSiswa.length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-info to-[#1976d2] flex items-center justify-center">
              <Search className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-hover transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-neutral-secondary mb-1">Kelas</p>
              <p className="text-xl font-bold text-neutral-text">
                {kelasInfo?.nama || "-"}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success to-success-dark flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <Card>
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-neutral-tertiary" />
            <input
              type="text"
              placeholder="Cari siswa berdasarkan nama atau NIS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-neutral-text placeholder:text-neutral-tertiary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-sm text-primary hover:text-primary-dark"
              >
                Clear
              </button>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Daftar Siswa */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-neutral-text">
              Daftar Siswa
            </h2>
            {filteredSiswa.length > 0 && (
              <span className="text-sm text-neutral-secondary">
                Menampilkan {filteredSiswa.length} dari {pagination.totalDocs}{" "}
                siswa
              </span>
            )}
          </div>

          {filteredSiswa.length > 0 ? (
            <div className="space-y-3">
              {filteredSiswa.map((siswa, index) => (
                <SiswaCard key={siswa._id} siswa={siswa} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-neutral-light" />
              <p className="text-neutral-secondary mb-2">
                {searchQuery
                  ? "Tidak ada siswa yang sesuai dengan pencarian"
                  : "Tidak ada siswa di kelas ini"}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-sm text-primary hover:text-primary-dark"
                >
                  Clear pencarian
                </button>
              )}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
