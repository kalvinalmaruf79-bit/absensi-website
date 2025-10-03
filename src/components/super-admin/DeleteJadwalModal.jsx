// src/components/super-admin/DeleteJadwalModal.jsx
"use client";

import { useState, useEffect } from "react";
import {
  Trash2,
  AlertTriangle,
  Info,
  X,
  AlertCircle,
  Database,
  Calendar,
  Clock,
} from "lucide-react";
import { superAdminService } from "@/services/super-admin.service";
import { showToast } from "@/lib/toast";

const hariMapping = {
  senin: "Senin",
  selasa: "Selasa",
  rabu: "Rabu",
  kamis: "Kamis",
  jumat: "Jumat",
  sabtu: "Sabtu",
};

export default function DeleteJadwalModal({
  jadwal,
  isOpen,
  onClose,
  onSuccess,
}) {
  const [deleteMode, setDeleteMode] = useState("soft");
  const [isDeleting, setIsDeleting] = useState(false);
  const [jadwalStats, setJadwalStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [showForceConfirm, setShowForceConfirm] = useState(false);

  useEffect(() => {
    if (isOpen && jadwal) {
      fetchJadwalStats();
    }

    return () => {
      setDeleteMode("soft");
      setShowForceConfirm(false);
    };
  }, [isOpen, jadwal]);

  const fetchJadwalStats = async () => {
    if (!jadwal?._id) return;

    try {
      setLoadingStats(true);
      const response = await superAdminService.getJadwalStats(jadwal._id);

      if (response.success) {
        setJadwalStats(response);
      } else if (response.stats) {
        setJadwalStats(response);
      } else {
        setJadwalStats(null);
      }
    } catch (error) {
      console.error("Error fetching jadwal stats:", error);
      showToast.error("Gagal memuat statistik jadwal");
      setJadwalStats(null);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSoftDelete = async () => {
    if (!jadwal?._id) return;

    setIsDeleting(true);
    try {
      const response = await superAdminService.deleteJadwal(jadwal._id);

      if (response.success) {
        showToast.success(response.message || "Jadwal berhasil dinonaktifkan");
        onSuccess?.();
        onClose();
      } else {
        showToast.error(response.message || "Gagal menonaktifkan jadwal");
      }
    } catch (error) {
      console.error("Error soft deleting:", error);
      const errorMsg =
        error.response?.data?.message || "Gagal menonaktifkan jadwal";
      showToast.error(errorMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleForceDelete = async () => {
    if (!jadwal?._id) return;

    if (!showForceConfirm) {
      setShowForceConfirm(true);
      return;
    }

    setIsDeleting(true);
    try {
      const response = await superAdminService.forceDeleteJadwal(
        jadwal._id,
        true
      );

      if (response.success) {
        showToast.success(
          response.message || "Jadwal berhasil dihapus permanen"
        );
        onSuccess?.();
        onClose();
      } else {
        showToast.error(response.message || "Gagal menghapus jadwal");
      }
    } catch (error) {
      console.error("Error force deleting:", error);

      if (error.response?.data?.dataRelasi) {
        const relasi = error.response.data.dataRelasi;
        const details = Object.entries(relasi)
          .filter(([_, count]) => count > 0)
          .map(([key, count]) => `${count} ${key}`)
          .join(", ");

        showToast.error(
          `${
            error.response.data.message || "Gagal menghapus jadwal"
          } (${details})`,
          { duration: 6000 }
        );
      } else {
        showToast.error(
          error.response?.data?.message || "Gagal menghapus jadwal permanen"
        );
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const resetModal = () => {
    setDeleteMode("soft");
    setShowForceConfirm(false);
    setJadwalStats(null);
  };

  const handleClose = () => {
    if (!isDeleting) {
      resetModal();
      onClose();
    }
  };

  if (!isOpen || !jadwal) return null;

  const isSafeToDelete = jadwalStats?.canSafeDelete || false;
  const hasData =
    jadwalStats?.stats &&
    Object.values(jadwalStats.stats).some((val) => val > 0);
  const totalData = jadwalStats?.totalRelasi || 0;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div
          className={`p-6 border-b ${
            deleteMode === "force"
              ? "bg-gradient-to-r from-red-50 to-orange-50"
              : "bg-gradient-to-r from-blue-50 to-cyan-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-lg ${
                  deleteMode === "force"
                    ? "bg-red-100 shadow-red-200 shadow-lg"
                    : "bg-[#00a3d4]/10 shadow-[#00a3d4]/20 shadow-lg"
                }`}
              >
                {deleteMode === "force" ? (
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                ) : (
                  <Trash2 className="w-6 h-6 text-[#00a3d4]" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-text">
                  {deleteMode === "force"
                    ? "Hapus Permanen"
                    : "Nonaktifkan Jadwal"}
                </h3>
                <p className="text-sm text-neutral-secondary mt-1">
                  {hariMapping[jadwal.hari]} | {jadwal.jamMulai} -{" "}
                  {jadwal.jamSelesai}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isDeleting}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-all disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Loading Stats */}
          {loadingStats && (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-[#00a3d4]/20 border-t-[#00a3d4] rounded-full animate-spin"></div>
            </div>
          )}

          {/* Jadwal Info */}
          {!loadingStats && (
            <div className="bg-gradient-to-br from-[#00a3d4]/5 to-cyan-50 border border-[#00a3d4]/20 rounded-lg p-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-[#00a3d4] mt-0.5" />
                  <div>
                    <span className="text-[#007fb9] font-medium">
                      Hari & Waktu:
                    </span>
                    <p className="font-semibold text-[#005f8b]">
                      {hariMapping[jadwal.hari]} | {jadwal.jamMulai} -{" "}
                      {jadwal.jamSelesai}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#00a3d4] mt-0.5" />
                  <div>
                    <span className="text-[#007fb9] font-medium">Kelas:</span>
                    <p className="font-semibold text-[#005f8b]">
                      {jadwal.kelas?.nama} - {jadwal.kelas?.tingkat}{" "}
                      {jadwal.kelas?.jurusan}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-[#00a3d4] mt-0.5" />
                  <div>
                    <span className="text-[#007fb9] font-medium">
                      Mata Pelajaran:
                    </span>
                    <p className="font-semibold text-[#005f8b]">
                      {jadwal.mataPelajaran?.nama} ({jadwal.mataPelajaran?.kode}
                      )
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-[#00a3d4] mt-0.5" />
                  <div>
                    <span className="text-[#007fb9] font-medium">Guru:</span>
                    <p className="font-semibold text-[#005f8b]">
                      {jadwal.guru?.name} ({jadwal.guru?.identifier})
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-[#00a3d4] mt-0.5" />
                  <div>
                    <span className="text-[#007fb9] font-medium">Periode:</span>
                    <p className="font-semibold text-[#005f8b] capitalize">
                      Semester {jadwal.semester} - {jadwal.tahunAjaran}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Jadwal Stats */}
          {!loadingStats && jadwalStats && jadwalStats.stats && (
            <div className="bg-gradient-to-br from-[#00a3d4]/5 to-cyan-50 border border-[#00a3d4]/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Database className="w-5 h-5 text-[#00a3d4] mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-[#005f8b] mb-3">
                    Data Terkait Jadwal
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#007fb9]">Absensi:</span>
                      <span className="font-semibold text-[#005f8b]">
                        {jadwalStats.stats.absensi || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#007fb9]">Sesi Presensi:</span>
                      <span className="font-semibold text-[#005f8b]">
                        {jadwalStats.stats.sesiPresensi || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#007fb9]">Nilai:</span>
                      <span className="font-semibold text-[#005f8b]">
                        {jadwalStats.stats.nilai || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#007fb9]">Tugas:</span>
                      <span className="font-semibold text-[#005f8b]">
                        {jadwalStats.stats.tugas || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#007fb9]">Materi:</span>
                      <span className="font-semibold text-[#005f8b]">
                        {jadwalStats.stats.materi || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#007fb9]">Total Data:</span>
                      <span className="font-semibold text-[#005f8b]">
                        {totalData}
                      </span>
                    </div>
                  </div>
                  {jadwalStats.recommendation && (
                    <div className="mt-3 pt-3 border-t border-[#00a3d4]/20">
                      <p className="text-sm text-[#007fb9]">
                        <span className="font-semibold">Rekomendasi:</span>{" "}
                        {jadwalStats.recommendation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Delete Mode Tabs */}
          <div className="flex gap-2 border-b border-neutral-border">
            <button
              onClick={() => {
                setDeleteMode("soft");
                setShowForceConfirm(false);
              }}
              disabled={isDeleting}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
                deleteMode === "soft"
                  ? "border-b-2 border-[#00a3d4] text-[#00a3d4] bg-[#00a3d4]/5"
                  : "text-neutral-secondary hover:text-neutral-text hover:bg-gray-50"
              } disabled:opacity-50 rounded-t-lg`}
            >
              <div className="flex items-center justify-center gap-2">
                <Info className="w-4 h-4" />
                Nonaktifkan (Aman)
              </div>
            </button>
            <button
              onClick={() => {
                setDeleteMode("force");
                setShowForceConfirm(false);
              }}
              disabled={isDeleting}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
                deleteMode === "force"
                  ? "border-b-2 border-red-600 text-red-600 bg-red-50"
                  : "text-neutral-secondary hover:text-neutral-text hover:bg-gray-50"
              } disabled:opacity-50 rounded-t-lg`}
            >
              <div className="flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Hapus Permanen (Berbahaya)
              </div>
            </button>
          </div>

          {/* Soft Delete Mode */}
          {deleteMode === "soft" && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-green-800">
                    <p className="font-semibold mb-2">
                      Mode Aman (Recommended)
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-green-700">
                      <li>Jadwal akan dinonaktifkan, tidak dihapus</li>
                      <li>Semua data history tetap tersimpan</li>
                      <li>Data absensi, nilai, tugas tetap aman</li>
                      <li>Jadwal tidak akan muncul di daftar aktif</li>
                      <li>Dapat diaktifkan kembali kapan saja</li>
                    </ul>
                  </div>
                </div>
              </div>

              {hasData && (
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-yellow-800">
                      Jadwal ini memiliki {totalData} data aktif. Dengan mode
                      soft delete, semua data ini akan tetap tersimpan dan dapat
                      diakses kembali jika jadwal diaktifkan.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Force Delete Mode */}
          {deleteMode === "force" && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-800">
                    <p className="font-bold text-lg mb-2">PERINGATAN SERIUS!</p>
                    <p className="font-semibold mb-2">
                      Penghapusan permanen TIDAK DAPAT dibatalkan!
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-red-700">
                      <li>Jadwal akan dihapus SELAMANYA dari database</li>
                      <li>
                        Semua {totalData} data terkait akan TERHAPUS PERMANEN
                      </li>
                      <li>
                        {jadwalStats?.stats?.absensi || 0} data absensi akan
                        hilang
                      </li>
                      <li>
                        {jadwalStats?.stats?.nilai || 0} data nilai akan hilang
                      </li>
                      <li>
                        {jadwalStats?.stats?.tugas || 0} tugas dan{" "}
                        {jadwalStats?.stats?.materi || 0} materi akan TERHAPUS
                      </li>
                      <li>Data TIDAK DAPAT dipulihkan kembali</li>
                    </ul>
                  </div>
                </div>
              </div>

              {!isSafeToDelete && jadwalStats && totalData > 0 && (
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-300 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-orange-800">
                      <p className="font-semibold mb-2">
                        Jadwal ini TIDAK aman untuk dihapus!
                      </p>
                      <p>
                        Ada {totalData} data yang akan terhapus permanen.
                        Pertimbangkan untuk:
                      </p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>
                          Backup data penting (absensi, nilai) terlebih dahulu
                        </li>
                        <li>Ekspor laporan sebelum menghapus</li>
                        <li>Gunakan mode "Nonaktifkan" sebagai alternatif</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {showForceConfirm && (
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-lg p-4 border-2 border-red-500 shadow-lg">
                  <p className="font-bold text-center text-lg mb-2">
                    KONFIRMASI TERAKHIR
                  </p>
                  <p className="text-center text-sm mb-3">
                    Anda yakin ingin menghapus permanen jadwal{" "}
                    <span className="font-bold">
                      {jadwal.mataPelajaran?.nama}
                    </span>{" "}
                    pada{" "}
                    <span className="font-bold">
                      {hariMapping[jadwal.hari]}
                    </span>
                    ?
                  </p>
                  <p className="text-center text-red-400 text-xs">
                    {totalData} data akan terhapus dan tidak dapat dibatalkan!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t bg-gradient-to-r from-gray-50 to-slate-50 flex gap-3">
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 border-2 border-neutral-border text-neutral-text rounded-lg hover:bg-white hover:shadow-md transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Batal
          </button>

          {deleteMode === "soft" ? (
            <button
              onClick={handleSoftDelete}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 bg-gradient-to-br from-[#00a3d4] to-[#005f8b] text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Nonaktifkan Jadwal
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleForceDelete}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 bg-gradient-to-br from-red-600 to-red-700 text-white rounded-lg hover:shadow-lg transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Menghapus Permanen...
                </>
              ) : showForceConfirm ? (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  YA, HAPUS PERMANEN!
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Hapus Permanen
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scale-in {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
