// src/app/(dashboard)/super-admin/kelas/[id]/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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

export default function DetailKelasPage() {
  const router = useRouter();
  const params = useParams();
  const kelasId = params.id;

  const [kelasData, setKelasData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (kelasId) {
      fetchKelasDetail();
    }
  }, [kelasId]);

  const fetchKelasDetail = async () => {
    try {
      setIsLoading(true);
      const [kelasResponse, statsResponse] = await Promise.all([
        superAdminService.getKelasById(kelasId),
        superAdminService.getKelasStats(kelasId),
      ]);

      if (kelasResponse.success) {
        setKelasData(kelasResponse.data);
      }
      if (statsResponse.success) {
        setStatsData(statsResponse);
      }
    } catch (error) {
      showToast.error("Gagal memuat data kelas");
      console.error("Error fetching kelas:", error);
      router.push("/super-admin/kelas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await superAdminService.deleteKelas(kelasId);
      showToast.success("Kelas berhasil dinonaktifkan");
      router.push("/super-admin/kelas");
    } catch (error) {
      showToast.error(
        error.response?.data?.message || "Gagal menonaktifkan kelas"
      );
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#00a3d4] animate-spin" />
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
        </div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, label, value, bgColor, iconColor }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div
          className={`w-14 h-14 rounded-lg ${bgColor} flex items-center justify-center`}
        >
          <Icon className={`w-7 h-7 ${iconColor}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/super-admin/kelas")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Kembali"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
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
                  <h1 className="text-3xl font-bold text-gray-900">
                    {kelasData.nama}
                  </h1>
                  {!kelasData.isActive && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-700">
                      <Archive className="w-4 h-4 mr-1" />
                      Nonaktif
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mt-1">
                  Kelas {kelasData.tingkat} • {kelasData.jurusan} •{" "}
                  {kelasData.tahunAjaran}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/super-admin/kelas/edit/${kelasId}`)}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2 font-medium shadow-md"
            >
              <Pencil className="w-5 h-5" />
              Edit
            </button>
            {kelasData.isActive && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-medium shadow-md"
              >
                <Trash2 className="w-5 h-5" />
                Nonaktifkan
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Wali Kelas Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-[#00a3d4]" />
          Wali Kelas
        </h2>
        {kelasData.waliKelas ? (
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {kelasData.waliKelas.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-lg">
                {kelasData.waliKelas.name}
              </p>
              <p className="text-sm text-gray-600">
                NIP: {kelasData.waliKelas.identifier}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-400">
            <AlertCircle className="w-5 h-5" />
            <span className="italic">Belum ditentukan</span>
          </div>
        )}
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
      </div>

      {/* Daftar Siswa */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-[#00a3d4]" />
          Daftar Siswa ({statsData?.siswa?.length || 0})
        </h2>

        {statsData?.siswa && statsData.siswa.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    No
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    NISN
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Nama Siswa
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {statsData.siswa.map((siswa, index) => (
                  <tr
                    key={siswa._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                      {siswa.identifier}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {siswa.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-lg">
              Belum ada siswa di kelas ini
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Tambahkan siswa melalui menu Manajemen User
            </p>
          </div>
        )}
      </div>

      {/* Recommendation Box */}
      {statsData?.recommendation && (
        <div
          className={`mt-6 rounded-lg p-6 border ${
            statsData.canSafeDelete
              ? "bg-green-50 border-green-200"
              : "bg-yellow-50 border-yellow-200"
          }`}
        >
          <div className="flex items-start gap-3">
            {statsData.canSafeDelete ? (
              <CheckSquare className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <h3
                className={`font-semibold mb-2 ${
                  statsData.canSafeDelete ? "text-green-900" : "text-yellow-900"
                }`}
              >
                Rekomendasi Penghapusan
              </h3>
              <p
                className={`text-sm ${
                  statsData.canSafeDelete ? "text-green-800" : "text-yellow-800"
                }`}
              >
                {statsData.recommendation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => !isDeleting && setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
              Konfirmasi Nonaktifkan
            </h3>
            <p className="text-gray-600 mb-6 text-center">
              Apakah Anda yakin ingin menonaktifkan kelas{" "}
              <strong>{kelasData.nama}</strong>? Kelas masih dapat dipulihkan
              kembali jika diperlukan.
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
                    <Trash2 className="w-4 h-4" />
                    Ya, Nonaktifkan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
