// src/app/(dashboard)/super-admin/jadwal/[id]/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Clock,
  BookOpen,
  GraduationCap,
  User,
  Edit,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  FileText,
  ClipboardCheck,
  BookMarked,
  Users,
} from "lucide-react";
import DeleteJadwalModal from "@/components/super-admin/DeleteJadwalModal";
import { superAdminService } from "@/services/super-admin.service";
import { showToast } from "@/lib/toast";
import Card from "@/components/ui/Card";

const hariMapping = {
  senin: "Senin",
  selasa: "Selasa",
  rabu: "Rabu",
  kamis: "Kamis",
  jumat: "Jumat",
  sabtu: "Sabtu",
};

export default function DetailJadwalPage() {
  const router = useRouter();
  const params = useParams();
  const jadwalId = params.id;

  const [jadwal, setJadwal] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (jadwalId) {
      fetchJadwalDetail();
    }
  }, [jadwalId]);

  const fetchJadwalDetail = async () => {
    setIsLoading(true);
    try {
      const [statsRes] = await Promise.all([
        superAdminService.getJadwalStats(jadwalId),
      ]);

      if (statsRes.success) {
        setJadwal(statsRes.jadwal);
        setStats(statsRes.stats);
      }
    } catch (error) {
      console.error("Error fetching jadwal detail:", error);
      showToast.error("Gagal memuat detail jadwal");
      router.push("/super-admin/jadwal");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false);
    router.push("/super-admin/jadwal");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-primary-main animate-spin" />
      </div>
    );
  }

  if (!jadwal) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-danger mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-neutral-text mb-2">
            Jadwal Tidak Ditemukan
          </h2>
          <button
            onClick={() => router.push("/super-admin/jadwal")}
            className="text-primary-main hover:underline"
          >
            Kembali ke Daftar Jadwal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-neutral-secondary hover:text-neutral-text transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Kembali</span>
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00a3d4] to-[#005f8b] flex items-center justify-center shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-text">
                Detail Jadwal
              </h1>
              <p className="text-neutral-secondary mt-1">
                Informasi lengkap jadwal pelajaran
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-4 py-2 rounded-lg font-semibold ${
                jadwal.isActive
                  ? "bg-success/10 text-success"
                  : "bg-neutral-light/50 text-neutral-secondary"
              }`}
            >
              {jadwal.isActive ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Aktif
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  Nonaktif
                </div>
              )}
            </span>
            {jadwal.isActive && (
              <>
                <button
                  onClick={() =>
                    router.push(`/super-admin/jadwal/${jadwalId}/edit`)
                  }
                  className="px-4 py-2 border border-neutral-border text-neutral-text rounded-lg hover:bg-neutral-surface transition-colors flex items-center gap-2 font-medium"
                >
                  <Edit className="w-5 h-5" />
                  Edit
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger-dark transition-colors flex items-center gap-2 font-medium"
                >
                  <Trash2 className="w-5 h-5" />
                  Hapus
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          <Card>
            <h2 className="text-xl font-bold text-neutral-text mb-4">
              Informasi Jadwal
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-neutral-surface/50 rounded-lg">
                <Calendar className="w-6 h-6 text-primary-main mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-neutral-secondary mb-1">
                    Hari & Waktu
                  </div>
                  <div className="font-semibold text-neutral-text text-lg">
                    {hariMapping[jadwal.hari]}
                  </div>
                  <div className="text-neutral-text font-mono mt-1">
                    {jadwal.jamMulai} - {jadwal.jamSelesai}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-neutral-surface/50 rounded-lg">
                <GraduationCap className="w-6 h-6 text-primary-main mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-neutral-secondary mb-1">
                    Kelas
                  </div>
                  <div className="font-semibold text-neutral-text text-lg">
                    {jadwal.kelas?.nama}
                  </div>
                  <div className="text-neutral-secondary mt-1">
                    {jadwal.kelas?.tingkat} {jadwal.kelas?.jurusan}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-neutral-surface/50 rounded-lg">
                <BookOpen className="w-6 h-6 text-primary-main mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-neutral-secondary mb-1">
                    Mata Pelajaran
                  </div>
                  <div className="font-semibold text-neutral-text text-lg">
                    {jadwal.mataPelajaran?.nama}
                  </div>
                  <div className="text-neutral-secondary mt-1">
                    Kode: {jadwal.mataPelajaran?.kode}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-neutral-surface/50 rounded-lg">
                <User className="w-6 h-6 text-primary-main mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-neutral-secondary mb-1">
                    Guru Pengampu
                  </div>
                  <div className="font-semibold text-neutral-text text-lg">
                    {jadwal.guru?.name}
                  </div>
                  <div className="text-neutral-secondary mt-1">
                    NIP: {jadwal.guru?.identifier}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-neutral-surface/50 rounded-lg">
                <Clock className="w-6 h-6 text-primary-main mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-neutral-secondary mb-1">
                    Periode
                  </div>
                  <div className="font-semibold text-neutral-text text-lg capitalize">
                    Semester {jadwal.semester}
                  </div>
                  <div className="text-neutral-secondary mt-1">
                    Tahun Ajaran {jadwal.tahunAjaran}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <Card>
            <h2 className="text-xl font-bold text-neutral-text mb-4">
              Statistik Data
            </h2>
            {stats && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-neutral-surface/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-primary-main" />
                    <span className="text-sm text-neutral-text">Absensi</span>
                  </div>
                  <span className="text-lg font-bold text-primary-main">
                    {stats.absensi}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-neutral-surface/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <ClipboardCheck className="w-5 h-5 text-primary-main" />
                    <span className="text-sm text-neutral-text">
                      Sesi Presensi
                    </span>
                  </div>
                  <span className="text-lg font-bold text-primary-main">
                    {stats.sesiPresensi}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-neutral-surface/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary-main" />
                    <span className="text-sm text-neutral-text">Nilai</span>
                  </div>
                  <span className="text-lg font-bold text-primary-main">
                    {stats.nilai}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-neutral-surface/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <ClipboardCheck className="w-5 h-5 text-primary-main" />
                    <span className="text-sm text-neutral-text">Tugas</span>
                  </div>
                  <span className="text-lg font-bold text-primary-main">
                    {stats.tugas}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-neutral-surface/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <BookMarked className="w-5 h-5 text-primary-main" />
                    <span className="text-sm text-neutral-text">Materi</span>
                  </div>
                  <span className="text-lg font-bold text-primary-main">
                    {stats.materi}
                  </span>
                </div>
              </div>
            )}
          </Card>

          <Card className="bg-gradient-to-br from-primary-light/10 to-primary-main/10 border border-primary-main/20">
            <div className="flex items-start gap-3">
              <Calendar className="w-6 h-6 text-primary-main mt-1" />
              <div>
                <h3 className="font-semibold text-neutral-text mb-2">
                  Info Tambahan
                </h3>
                <div className="text-sm text-neutral-secondary space-y-2">
                  <p>
                    Jadwal ini{" "}
                    {jadwal.isActive
                      ? "sedang aktif dan berjalan"
                      : "tidak aktif"}
                  </p>
                  {stats && (
                    <p>
                      Total {Object.values(stats).reduce((a, b) => a + b, 0)}{" "}
                      data terkait dengan jadwal ini
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {showDeleteModal && (
        <DeleteJadwalModal
          jadwal={jadwal}
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
}
