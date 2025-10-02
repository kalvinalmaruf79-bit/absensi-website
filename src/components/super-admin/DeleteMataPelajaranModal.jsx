"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  X,
  Loader2,
  Trash2,
  Info,
  Database,
  AlertCircle,
} from "lucide-react";
import { superAdminService } from "@/services/super-admin.service";
import { showToast } from "@/lib/toast";

export default function DeleteMataPelajaranModal({
  isOpen,
  onClose,
  mataPelajaran,
  onSuccess,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [deleteMode, setDeleteMode] = useState("soft");
  const [showForceConfirm, setShowForceConfirm] = useState(false);
  const [mapelStats, setMapelStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (isOpen && mataPelajaran) {
      fetchMapelStats();
    }

    return () => {
      setDeleteMode("soft");
      setShowForceConfirm(false);
    };
  }, [isOpen, mataPelajaran]);

  const fetchMapelStats = async () => {
    if (!mataPelajaran?._id) return;

    try {
      setLoadingStats(true);
      const response = await superAdminService.getMataPelajaranStats(
        mataPelajaran._id
      );

      if (response.success) {
        setMapelStats(response);
      } else if (response.stats) {
        setMapelStats(response);
      } else {
        setMapelStats(null);
      }
    } catch (error) {
      console.error("Error fetching mata pelajaran stats:", error);
      showToast.error("Gagal memuat statistik mata pelajaran");
      setMapelStats(null);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleDelete = async () => {
    if (!mataPelajaran?._id) return;

    setIsLoading(true);
    try {
      const response = await superAdminService.deleteMataPelajaran(
        mataPelajaran._id
      );

      showToast.success(
        response.message || "Mata pelajaran berhasil dinonaktifkan"
      );

      if (onSuccess) {
        await onSuccess();
      }
      onClose();
    } catch (error) {
      console.error("Error deleting mata pelajaran:", error);
      showToast.error(
        error.response?.data?.message || "Gagal menonaktifkan mata pelajaran"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForceDelete = async () => {
    if (!mataPelajaran?._id) return;

    if (!showForceConfirm) {
      setShowForceConfirm(true);
      return;
    }

    setIsLoading(true);
    try {
      const response = await superAdminService.forceDeleteMataPelajaran(
        mataPelajaran._id,
        true
      );

      showToast.success(
        response.message || "Mata pelajaran berhasil dihapus permanen"
      );

      if (onSuccess) {
        await onSuccess();
      }
      onClose();
    } catch (error) {
      console.error("Error force deleting mata pelajaran:", error);

      if (error.response?.data?.dataRelasi) {
        const relasi = error.response.data.dataRelasi;
        const details = Object.entries(relasi)
          .filter(([_, count]) => count > 0)
          .map(([key, count]) => `${count} ${key}`)
          .join(", ");

        showToast.error(
          `${
            error.response.data.message || "Gagal menghapus mata pelajaran"
          } (${details})`,
          { duration: 6000 }
        );
      } else {
        showToast.error(
          error.response?.data?.message ||
            "Gagal menghapus mata pelajaran permanen"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setDeleteMode("soft");
    setShowForceConfirm(false);
    setMapelStats(null);
  };

  const handleClose = () => {
    if (!isLoading) {
      resetModal();
      onClose();
    }
  };

  if (!isOpen || !mataPelajaran) return null;

  const hasTeachers = (mataPelajaran.jumlahGuru || 0) > 0;
  const isSafeToDelete = mapelStats?.canSafeDelete || false;
  const hasData =
    mapelStats?.stats && Object.values(mapelStats.stats).some((val) => val > 0);

  return (
    <AnimatePresence mode="wait">
      {isOpen && mataPelajaran && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
          key="modal-overlay"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in"
          >
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
                    className={`w-12 h-12 rounded-full ${
                      deleteMode === "force"
                        ? "bg-red-100 shadow-red-200 shadow-lg"
                        : "bg-[#00a3d4]/10 shadow-[#00a3d4]/20 shadow-lg"
                    } flex items-center justify-center`}
                  >
                    {deleteMode === "force" ? (
                      <Trash2 className="w-6 h-6 text-red-600" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-[#00a3d4]" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-text">
                      {deleteMode === "force"
                        ? "Hapus Permanen"
                        : "Nonaktifkan Mata Pelajaran"}
                    </h3>
                    <p className="text-sm text-neutral-secondary mt-1">
                      {mataPelajaran.nama}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isLoading}
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
                <div
                  key="loading-stats"
                  className="flex items-center justify-center py-8"
                >
                  <div className="w-8 h-8 border-4 border-[#00a3d4]/20 border-t-[#00a3d4] rounded-full animate-spin"></div>
                </div>
              )}

              {/* Mata Pelajaran Stats */}
              {!loadingStats && mapelStats && mapelStats.stats && (
                <div
                  key="mapel-stats"
                  className="bg-gradient-to-br from-[#00a3d4]/5 to-cyan-50 border border-[#00a3d4]/20 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <Database className="w-5 h-5 text-[#00a3d4] mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#005f8b] mb-3">
                        Data Terkait Mata Pelajaran
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[#007fb9]">Guru:</span>
                          <span className="font-semibold text-[#005f8b]">
                            {mapelStats.stats.jumlahGuru || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#007fb9]">Jadwal:</span>
                          <span className="font-semibold text-[#005f8b]">
                            {mapelStats.stats.jumlahJadwal || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#007fb9]">Nilai:</span>
                          <span className="font-semibold text-[#005f8b]">
                            {mapelStats.stats.jumlahNilai || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#007fb9]">Tugas:</span>
                          <span className="font-semibold text-[#005f8b]">
                            {mapelStats.stats.jumlahTugas || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#007fb9]">Materi:</span>
                          <span className="font-semibold text-[#005f8b]">
                            {mapelStats.stats.jumlahMateri || 0}
                          </span>
                        </div>
                      </div>
                      {mapelStats.recommendation && (
                        <div className="mt-3 pt-3 border-t border-[#00a3d4]/20">
                          <p className="text-sm text-[#007fb9]">
                            <span className="font-semibold">Rekomendasi:</span>{" "}
                            {mapelStats.recommendation}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
                    deleteMode === "force"
                      ? "border-b-2 border-red-600 text-red-600 bg-red-50"
                      : "text-neutral-secondary hover:text-neutral-text hover:bg-gray-50"
                  } disabled:opacity-50 rounded-t-lg`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Hapus Permanen
                  </div>
                </button>
              </div>

              {/* Soft Delete Mode */}
              {deleteMode === "soft" && (
                <div key="soft-delete-content" className="space-y-4">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-green-800">
                        <p className="font-semibold mb-2">
                          Mode Aman (Recommended)
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-green-700">
                          <li>
                            Mata pelajaran akan dinonaktifkan, tidak dihapus
                          </li>
                          <li>Semua data terkait tetap tersimpan</li>
                          <li>Dapat diaktifkan kembali kapan saja</li>
                          <li>Tidak akan muncul di daftar aktif</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-neutral-surface rounded-lg p-4 border border-neutral-border">
                    <p className="font-semibold text-neutral-text mb-2">
                      {mataPelajaran.nama}
                    </p>
                    <p className="text-sm text-neutral-secondary">
                      Kode: {mataPelajaran.kode}
                    </p>
                    {hasTeachers && (
                      <p className="text-sm text-warning mt-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {mataPelajaran.jumlahGuru} guru sedang mengampu mata
                        pelajaran ini
                      </p>
                    )}
                  </div>

                  {hasData && (
                    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-yellow-800">
                          Mata pelajaran ini memiliki data aktif. Data akan
                          tetap tersimpan dan dapat diaktifkan kembali kapan
                          saja.
                        </p>
                      </div>
                    </div>
                  )}

                  <p className="text-sm text-neutral-secondary">
                    Mata pelajaran yang dinonaktifkan dapat diaktifkan kembali
                    kapan saja.
                  </p>
                </div>
              )}

              {/* Force Delete Mode */}
              {deleteMode === "force" && (
                <div key="force-delete-content" className="space-y-4">
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-red-800">
                        <p className="font-bold text-lg mb-2">
                          PERINGATAN SERIUS!
                        </p>
                        <p className="font-semibold mb-2">
                          Penghapusan permanen TIDAK DAPAT dibatalkan!
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-red-700">
                          <li>
                            Mata pelajaran akan dihapus SELAMANYA dari database
                          </li>
                          <li>Semua penugasan guru akan TERHAPUS</li>
                          <li>Semua jadwal terkait akan TERHAPUS</li>
                          <li>Semua nilai, tugas, dan materi akan TERHAPUS</li>
                          <li>Data TIDAK DAPAT dipulihkan kembali</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {!isSafeToDelete && mapelStats?.stats && (
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-300 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-orange-800">
                          <p className="font-semibold mb-2">
                            Mata pelajaran ini TIDAK aman untuk dihapus!
                          </p>
                          <p>
                            Ada {mapelStats.stats.jumlahGuru || 0} guru dan{" "}
                            {mapelStats.stats.jumlahNilai || 0} nilai yang akan
                            terhapus. Pertimbangkan untuk:
                          </p>
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Lepas penugasan guru terlebih dahulu</li>
                            <li>Backup data penting sebelum menghapus</li>
                            <li>
                              Gunakan mode "Nonaktifkan" sebagai alternatif
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-neutral-surface rounded-lg p-4 border border-neutral-border">
                    <p className="font-semibold text-neutral-text mb-2">
                      {mataPelajaran.nama}
                    </p>
                    <p className="text-sm text-neutral-secondary">
                      Kode: {mataPelajaran.kode}
                    </p>
                    {hasTeachers && (
                      <p className="text-sm text-red-600 mt-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {mataPelajaran.jumlahGuru} guru akan kehilangan
                        penugasan ini
                      </p>
                    )}
                  </div>

                  {showForceConfirm && (
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-lg p-4 border-2 border-red-500 shadow-lg">
                      <p className="font-bold text-center text-lg mb-2">
                        KONFIRMASI TERAKHIR
                      </p>
                      <p className="text-center text-sm mb-3">
                        Anda yakin ingin menghapus permanen mata pelajaran{" "}
                        <span className="font-bold">{mataPelajaran.nama}</span>?
                      </p>
                      <p className="text-center text-red-400 text-xs">
                        Tindakan ini tidak dapat dibatalkan!
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Guru List */}
              {mapelStats?.guru && mapelStats.guru.length > 0 && (
                <div
                  key="guru-list"
                  className="bg-gradient-to-br from-gray-50 to-slate-50 border border-neutral-border rounded-lg p-4"
                >
                  <h4 className="font-semibold text-neutral-text mb-3">
                    Guru Pengampu ({mapelStats.guru.length})
                  </h4>
                  <div className="max-h-32 overflow-y-auto space-y-2">
                    {mapelStats.guru.slice(0, 5).map((guru) => (
                      <div
                        key={guru._id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00a3d4] to-[#005f8b] flex items-center justify-center text-white font-semibold shadow">
                          {guru.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="font-medium text-neutral-text">
                            {guru.name || "Nama tidak tersedia"}
                          </p>
                          {guru.identifier && (
                            <p className="text-xs text-neutral-secondary">
                              {guru.identifier}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    {mapelStats.guru.length > 5 && (
                      <p className="text-xs text-neutral-secondary text-center pt-2">
                        ... dan {mapelStats.guru.length - 5} guru lainnya
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-neutral-border px-6 py-4 bg-gradient-to-r from-gray-50 to-slate-50 flex gap-3">
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 border-2 border-neutral-border text-neutral-text rounded-lg hover:bg-white hover:shadow-md transition-all font-medium disabled:opacity-50"
              >
                Batal
              </button>

              {deleteMode === "soft" ? (
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 bg-danger text-white rounded-lg hover:bg-danger-dark transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-5 h-5" />
                      Nonaktifkan
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleForceDelete}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-br from-red-600 to-red-700 text-white rounded-lg hover:shadow-lg transition-all font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Menghapus Permanen...
                    </>
                  ) : showForceConfirm ? (
                    <>
                      <AlertTriangle className="w-5 h-5" />
                      YA, HAPUS PERMANEN!
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      Hapus Permanen
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
