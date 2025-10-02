// src/components/super-admin/DeleteKelasModal.jsx
"use client";

import { useState, useEffect } from "react";
import {
  Trash2,
  AlertTriangle,
  Info,
  X,
  AlertCircle,
  Database,
} from "lucide-react";
import { superAdminService } from "@/services/super-admin.service";
import { showToast } from "@/lib/toast";

export default function DeleteKelasModal({
  kelas,
  isOpen,
  onClose,
  onSuccess,
}) {
  const [deleteMode, setDeleteMode] = useState("soft");
  const [isDeleting, setIsDeleting] = useState(false);
  const [kelasStats, setKelasStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [showForceConfirm, setShowForceConfirm] = useState(false);

  useEffect(() => {
    if (isOpen && kelas) {
      fetchKelasStats();
    }

    return () => {
      setDeleteMode("soft");
      setShowForceConfirm(false);
    };
  }, [isOpen, kelas]);

  const fetchKelasStats = async () => {
    if (!kelas?._id) return;

    try {
      setLoadingStats(true);
      const response = await superAdminService.getKelasStats(kelas._id);

      if (response.success) {
        setKelasStats(response);
      } else if (response.stats) {
        setKelasStats(response);
      } else {
        setKelasStats(null);
      }
    } catch (error) {
      console.error("Error fetching kelas stats:", error);
      showToast.error("Gagal memuat statistik kelas");
      setKelasStats(null);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSoftDelete = async () => {
    if (!kelas?._id) return;

    setIsDeleting(true);
    try {
      const response = await superAdminService.deleteKelas(kelas._id);

      if (response.success) {
        showToast.success(response.message || "Kelas berhasil dinonaktifkan");
        onSuccess?.();
        onClose();
      } else {
        showToast.error(response.message || "Gagal menonaktifkan kelas");
      }
    } catch (error) {
      console.error("Error soft deleting:", error);
      const errorMsg =
        error.response?.data?.message || "Gagal menonaktifkan kelas";
      showToast.error(errorMsg);

      if (error.response?.data?.canForceDelete) {
        showToast.warning(
          "Pertimbangkan untuk menggunakan Force Delete atau pindahkan siswa terlebih dahulu"
        );
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleForceDelete = async () => {
    if (!kelas?._id) return;

    if (!showForceConfirm) {
      setShowForceConfirm(true);
      return;
    }

    setIsDeleting(true);
    try {
      const response = await superAdminService.forceDeleteKelas(
        kelas._id,
        true
      );

      if (response.success) {
        showToast.success(
          response.message || "Kelas berhasil dihapus permanen"
        );
        onSuccess?.();
        onClose();
      } else {
        showToast.error(response.message || "Gagal menghapus kelas");
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
            error.response.data.message || "Gagal menghapus kelas"
          } (${details})`,
          { duration: 6000 }
        );
      } else {
        showToast.error(
          error.response?.data?.message || "Gagal menghapus kelas permanen"
        );
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const resetModal = () => {
    setDeleteMode("soft");
    setShowForceConfirm(false);
    setKelasStats(null);
  };

  const handleClose = () => {
    if (!isDeleting) {
      resetModal();
      onClose();
    }
  };

  if (!isOpen || !kelas) return null;

  const isSafeToDelete = kelasStats?.canSafeDelete || false;
  const hasData =
    kelasStats?.stats && Object.values(kelasStats.stats).some((val) => val > 0);

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
                    : "Nonaktifkan Kelas"}
                </h3>
                <p className="text-sm text-neutral-secondary mt-1">
                  {kelas.nama} - {kelas.tingkat} {kelas.jurusan || ""}
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

          {/* Kelas Stats */}
          {!loadingStats && kelasStats && kelasStats.stats && (
            <div className="bg-gradient-to-br from-[#00a3d4]/5 to-cyan-50 border border-[#00a3d4]/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Database className="w-5 h-5 text-[#00a3d4] mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-[#005f8b] mb-3">
                    Data Terkait Kelas
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#007fb9]">Siswa:</span>
                      <span className="font-semibold text-[#005f8b]">
                        {kelasStats.stats.jumlahSiswa || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#007fb9]">Jadwal:</span>
                      <span className="font-semibold text-[#005f8b]">
                        {kelasStats.stats.jumlahJadwal || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#007fb9]">Nilai:</span>
                      <span className="font-semibold text-[#005f8b]">
                        {kelasStats.stats.jumlahNilai || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#007fb9]">Absensi:</span>
                      <span className="font-semibold text-[#005f8b]">
                        {kelasStats.stats.jumlahAbsensi || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#007fb9]">Tugas:</span>
                      <span className="font-semibold text-[#005f8b]">
                        {kelasStats.stats.jumlahTugas || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#007fb9]">Materi:</span>
                      <span className="font-semibold text-[#005f8b]">
                        {kelasStats.stats.jumlahMateri || 0}
                      </span>
                    </div>
                  </div>
                  {kelasStats.recommendation && (
                    <div className="mt-3 pt-3 border-t border-[#00a3d4]/20">
                      <p className="text-sm text-[#007fb9]">
                        <span className="font-semibold">Rekomendasi:</span>{" "}
                        {kelasStats.recommendation}
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
                      <li>Kelas akan dinonaktifkan, tidak dihapus</li>
                      <li>Semua data tetap tersimpan dan dapat dipulihkan</li>
                      <li>Siswa akan tetap di kelas ini sampai dipindahkan</li>
                      <li>Kelas tidak akan muncul di daftar aktif</li>
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
                      Kelas ini memiliki data aktif. Jika ada siswa aktif,
                      mereka harus dipindahkan terlebih dahulu sebelum dapat
                      dinonaktifkan.
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
                      <li>Kelas akan dihapus SELAMANYA dari database</li>
                      <li>Semua siswa akan kehilangan kelasnya</li>
                      <li>Semua jadwal, nilai, absensi akan TERHAPUS</li>
                      <li>Semua tugas dan materi akan TERHAPUS</li>
                      <li>Data TIDAK DAPAT dipulihkan kembali</li>
                    </ul>
                  </div>
                </div>
              </div>

              {!isSafeToDelete && kelasStats && (
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-300 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-orange-800">
                      <p className="font-semibold mb-2">
                        Kelas ini TIDAK aman untuk dihapus!
                      </p>
                      <p>
                        Ada {kelasStats.stats?.jumlahSiswa || 0} siswa dan{" "}
                        {kelasStats.stats?.jumlahNilai || 0} nilai yang akan
                        terhapus. Pertimbangkan untuk:
                      </p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Pindahkan siswa ke kelas lain terlebih dahulu</li>
                        <li>Backup data penting sebelum menghapus</li>
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
                    Anda yakin ingin menghapus permanen kelas{" "}
                    <span className="font-bold">{kelas.nama}</span>?
                  </p>
                  <p className="text-center text-red-400 text-xs">
                    Tindakan ini tidak dapat dibatalkan!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Siswa List */}
          {kelasStats?.siswa && kelasStats.siswa.length > 0 && (
            <div className="bg-gradient-to-br from-gray-50 to-slate-50 border border-neutral-border rounded-lg p-4">
              <h4 className="font-semibold text-neutral-text mb-3">
                Siswa di Kelas ({kelasStats.siswa.length})
              </h4>
              <div className="max-h-32 overflow-y-auto space-y-2">
                {kelasStats.siswa.slice(0, 5).map((siswa) => (
                  <div
                    key={siswa._id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00a3d4] to-[#005f8b] flex items-center justify-center text-white font-semibold shadow">
                      {siswa.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="font-medium text-neutral-text">
                        {siswa.name || "Nama tidak tersedia"}
                      </p>
                      {siswa.identifier && (
                        <p className="text-xs text-neutral-secondary">
                          {siswa.identifier}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {kelasStats.siswa.length > 5 && (
                  <p className="text-xs text-neutral-secondary text-center pt-2">
                    ... dan {kelasStats.siswa.length - 5} siswa lainnya
                  </p>
                )}
              </div>
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
                  Nonaktifkan Kelas
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
