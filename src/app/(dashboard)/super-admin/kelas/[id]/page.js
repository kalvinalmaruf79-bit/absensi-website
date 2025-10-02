// src/app/(dashboard)/super-admin/kelas/[id]/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import EmptyState from "@/components/shared/EmptyState";
import {
  ArrowLeft,
  GraduationCap,
  Users,
  UserCheck,
  Calendar,
  BookOpen,
  ClipboardList,
  FileText,
  CheckSquare,
  AlertCircle,
  Pencil,
  Trash2,
  Archive,
  Loader2,
} from "lucide-react";
import { superAdminService } from "@/services/super-admin.service";
import { showToast } from "@/lib/toast";

// Helper component for Stat Cards
const StatCard = ({ icon: Icon, label, value, bgColor, iconColor }) => (
  <div className="bg-white rounded-lg shadow-soft p-6 border border-neutral-border hover:shadow-lg transition-shadow duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-neutral-secondary mb-1">{label}</p>
        <p className="text-3xl font-bold text-neutral-text">{value}</p>
      </div>
      <div
        className={`w-14 h-14 rounded-lg ${bgColor} flex items-center justify-center`}
      >
        <Icon className={`w-7 h-7 ${iconColor}`} />
      </div>
    </div>
  </div>
);

export default function DetailKelasPage() {
  const router = useRouter();
  const params = useParams();
  const kelasId = params.id;

  const [kelasData, setKelasData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchKelasDetail = useCallback(async () => {
    if (!kelasId) return;

    try {
      setIsLoading(true);
      const [kelasResponse, statsResponse] = await Promise.all([
        superAdminService.getKelasById(kelasId),
        superAdminService.getKelasStats(kelasId),
      ]);

      if (kelasResponse.success) {
        setKelasData(kelasResponse.data);
      } else {
        throw new Error("Gagal memuat data detail kelas.");
      }

      if (statsResponse.success) {
        setStatsData(statsResponse);
      } else {
        throw new Error("Gagal memuat statistik kelas.");
      }
    } catch (error) {
      showToast.error(error.message || "Gagal memuat data.");
      console.error("Error fetching kelas detail:", error);
      router.push("/super-admin/kelas");
    } finally {
      setIsLoading(false);
    }
  }, [kelasId, router]);

  useEffect(() => {
    fetchKelasDetail();
  }, [fetchKelasDetail]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await superAdminService.deleteKelas(kelasId);
      showToast.success("Kelas berhasil dinonaktifkan");
      router.push("/super-admin/kelas");
    } catch (error) {
      showToast.error(
        error.response?.data?.message || "Gagal menonaktifkan kelas"
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#00a3d4] animate-spin" />
          <p className="text-neutral-secondary">Memuat detail kelas...</p>
        </div>
      </div>
    );
  }

  if (!kelasData) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl text-gray-700">Kelas tidak ditemukan</p>
          <button
            onClick={() => router.push("/super-admin/kelas")}
            className="mt-4 px-4 py-2 text-white bg-primary-main rounded-lg"
          >
            Kembali ke Daftar Kelas
          </button>
        </div>
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-neutral-surface rounded-lg transition-colors"
              title="Kembali"
            >
              <ArrowLeft className="w-6 h-6 text-neutral-secondary" />
            </button>
            <div className="flex items-center gap-3">
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${
                  kelasData.isActive
                    ? "bg-gradient-to-br from-[#00a3d4] to-[#005f8b]"
                    : "bg-gray-400"
                }`}
              >
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-neutral-text">
                    {kelasData.nama}
                  </h1>
                  {!kelasData.isActive && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-700">
                      <Archive className="w-4 h-4 mr-1" />
                      Nonaktif
                    </span>
                  )}
                </div>
                <p className="text-neutral-secondary mt-1">
                  Kelas {kelasData.tingkat} • {kelasData.jurusan} •{" "}
                  {kelasData.tahunAjaran}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/super-admin/kelas/edit/${kelasId}`)}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2 font-medium shadow-soft"
            >
              <Pencil className="w-5 h-5" />
              Edit
            </button>
            {kelasData.isActive && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-medium shadow-soft"
              >
                <Trash2 className="w-5 h-5" />
                Nonaktifkan
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Wali Kelas & Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1 bg-white rounded-lg shadow-soft p-6 border border-neutral-border"
        >
          <h2 className="text-lg font-semibold text-neutral-text mb-4 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#00a3d4]" />
            Wali Kelas
          </h2>
          {kelasData.waliKelas ? (
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center text-green-700 font-bold text-2xl shadow-sm">
                {kelasData.waliKelas.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-neutral-text text-lg">
                  {kelasData.waliKelas.name}
                </p>
                <p className="text-sm text-neutral-secondary">
                  NIP: {kelasData.waliKelas.identifier}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-neutral-secondary italic">
              <AlertCircle className="w-5 h-5" />
              <span>Belum ditentukan</span>
            </div>
          )}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          <StatCard
            icon={Users}
            label="Jumlah Siswa"
            value={statsData?.stats?.jumlahSiswa || 0}
            bgColor="bg-blue-100"
            iconColor="text-blue-600"
          />
          <StatCard
            icon={Calendar}
            label="Jadwal Pelajaran"
            value={statsData?.stats?.jumlahJadwal || 0}
            bgColor="bg-purple-100"
            iconColor="text-purple-600"
          />
        </motion.div>
      </div>

      {/* Additional Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6"
      >
        <StatCard
          icon={CheckSquare}
          label="Total Nilai"
          value={statsData?.stats?.jumlahNilai || 0}
          bgColor="bg-green-100"
          iconColor="text-green-600"
        />
        <StatCard
          icon={ClipboardList}
          label="Rekap Absensi"
          value={statsData?.stats?.jumlahAbsensi || 0}
          bgColor="bg-orange-100"
          iconColor="text-orange-600"
        />
        <StatCard
          icon={FileText}
          label="Tugas Diberikan"
          value={statsData?.stats?.jumlahTugas || 0}
          bgColor="bg-indigo-100"
          iconColor="text-indigo-600"
        />
        <StatCard
          icon={BookOpen}
          label="Materi Tersedia"
          value={statsData?.stats?.jumlahMateri || 0}
          bgColor="bg-pink-100"
          iconColor="text-pink-600"
        />
      </motion.div>

      {/* Daftar Siswa */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg shadow-soft p-6 border border-neutral-border"
      >
        <h2 className="text-lg font-semibold text-neutral-text mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-[#00a3d4]" />
          Daftar Siswa ({statsData?.siswa?.length || 0})
        </h2>
        {statsData?.siswa && statsData.siswa.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-surface">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-text w-16">
                    No
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-text">
                    NISN
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-text">
                    Nama Siswa
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border">
                {statsData.siswa.map((siswa, index) => (
                  <tr
                    key={siswa._id}
                    className="hover:bg-neutral-surface transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-neutral-text">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-secondary font-mono">
                      {siswa.identifier}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-text font-medium">
                      {siswa.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={<Users className="w-16 h-16 text-neutral-subtle" />}
            title="Belum Ada Siswa"
            description="Tambahkan siswa ke kelas ini melalui menu Manajemen User."
          />
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => !isDeleting && setShowDeleteConfirm(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-neutral-text mb-2 text-center">
              Konfirmasi Nonaktifkan
            </h3>
            <p className="text-neutral-secondary mb-6 text-center">
              Anda yakin ingin menonaktifkan kelas{" "}
              <strong>{kelasData.nama}</strong>? Kelas ini masih dapat
              diaktifkan kembali nanti.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Archive className="w-4 h-4" />
                    Ya, Nonaktifkan
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
