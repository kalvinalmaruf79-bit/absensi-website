// src/components/super-admin/DeleteUserModal.jsx
"use client";

import { useState, useEffect } from "react";
import {
  Trash2,
  AlertTriangle,
  Info,
  X,
  AlertCircle,
  Database,
  RotateCcw,
} from "lucide-react";
import { superAdminService } from "@/services/super-admin.service";
import { showToast } from "@/lib/toast";

export default function DeleteUserModal({ user, isOpen, onClose, onSuccess }) {
  const [deleteMode, setDeleteMode] = useState("soft");
  const [isDeleting, setIsDeleting] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [showForceConfirm, setShowForceConfirm] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchUserStats();
    }

    return () => {
      setDeleteMode("soft");
      setShowForceConfirm(false);
    };
  }, [isOpen, user]);

  const fetchUserStats = async () => {
    if (!user?._id) return;

    try {
      setLoadingStats(true);
      const response = await superAdminService.getUserStats(user._id);

      if (response.success) {
        setUserStats(response);
      } else if (response.stats) {
        setUserStats(response);
      } else {
        setUserStats(null);
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
      showToast.error("Gagal memuat statistik user");
      setUserStats(null);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSoftDelete = async () => {
    if (!user?._id) return;

    setIsDeleting(true);
    try {
      const response = await superAdminService.deleteUser(user._id);
      showToast.success(`User ${user.name} berhasil dinonaktifkan`);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error soft deleting:", error);
      const errorMsg =
        error.response?.data?.message || "Gagal menonaktifkan user";
      showToast.error(errorMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleForceDelete = async () => {
    if (!user?._id) return;

    if (!showForceConfirm) {
      setShowForceConfirm(true);
      return;
    }

    setIsDeleting(true);
    try {
      const response = await superAdminService.forceDeleteUser(user._id, true);

      if (response.success) {
        showToast.success(response.message || "User berhasil dihapus permanen");
        onSuccess?.();
        onClose();
      } else {
        showToast.error(response.message || "Gagal menghapus user");
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
            error.response.data.message || "Gagal menghapus user"
          } (${details})`,
          { duration: 6000 }
        );
      } else {
        showToast.error(
          error.response?.data?.message || "Gagal menghapus user permanen"
        );
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const resetModal = () => {
    setDeleteMode("soft");
    setShowForceConfirm(false);
    setUserStats(null);
  };

  const handleClose = () => {
    if (!isDeleting) {
      resetModal();
      onClose();
    }
  };

  if (!isOpen || !user) return null;

  const isSafeToDelete = userStats?.canSafeDelete || false;
  const hasData =
    userStats?.stats && Object.values(userStats.stats).some((val) => val > 0);

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
                    : "Nonaktifkan User"}
                </h3>
                <p className="text-sm text-neutral-secondary mt-1">
                  {user.name} - {user.role === "guru" ? "Guru" : "Siswa"}
                </p>
                <p className="text-xs text-neutral-secondary">
                  {user.identifier}
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

          {/* User Stats */}
          {!loadingStats && userStats && userStats.stats && (
            <div className="bg-gradient-to-br from-[#00a3d4]/5 to-cyan-50 border border-[#00a3d4]/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Database className="w-5 h-5 text-[#00a3d4] mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-[#005f8b] mb-3">
                    Data Terkait {user.role === "guru" ? "Guru" : "Siswa"}
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {user.role === "guru" ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-[#007fb9]">
                            Mata Pelajaran:
                          </span>
                          <span className="font-semibold text-[#005f8b]">
                            {userStats.stats.mataPelajaran || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#007fb9]">Jadwal:</span>
                          <span className="font-semibold text-[#005f8b]">
                            {userStats.stats.jadwal || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#007fb9]">Materi:</span>
                          <span className="font-semibold text-[#005f8b]">
                            {userStats.stats.materi || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#007fb9]">Tugas:</span>
                          <span className="font-semibold text-[#005f8b]">
                            {userStats.stats.tugas || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#007fb9]">Nilai:</span>
                          <span className="font-semibold text-[#005f8b]">
                            {userStats.stats.nilai || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#007fb9]">Sesi Presensi:</span>
                          <span className="font-semibold text-[#005f8b]">
                            {userStats.stats.sesiPresensi || 0}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span className="text-[#007fb9]">Kelas:</span>
                          <span className="font-semibold text-[#005f8b]">
                            {userStats.stats.kelas || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#007fb9]">Nilai:</span>
                          <span className="font-semibold text-[#005f8b]">
                            {userStats.stats.nilai || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#007fb9]">Absensi:</span>
                          <span className="font-semibold text-[#005f8b]">
                            {userStats.stats.absensi || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#007fb9]">Tugas:</span>
                          <span className="font-semibold text-[#005f8b]">
                            {userStats.stats.tugas || 0}
                          </span>
                        </div>
                        <div className="flex justify-between col-span-2">
                          <span className="text-[#007fb9]">Riwayat Kelas:</span>
                          <span className="font-semibold text-[#005f8b]">
                            {userStats.stats.riwayatKelas || 0}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#00a3d4]/20">
                    <p className="text-sm text-[#007fb9]">
                      <span className="font-semibold">Total Data Terkait:</span>{" "}
                      {userStats.totalRelasi || 0}
                    </p>
                  </div>
                  {userStats.recommendation && (
                    <div className="mt-2">
                      <p className="text-sm text-[#007fb9]">
                        <span className="font-semibold">Rekomendasi:</span>{" "}
                        {userStats.recommendation}
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
                      <li>User akan dinonaktifkan, tidak dihapus</li>
                      <li>Semua data tetap tersimpan dan dapat dipulihkan</li>
                      <li>User tidak dapat login ke sistem</li>
                      <li>Data history tetap utuh</li>
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
                      User ini memiliki {userStats?.totalRelasi || 0} data
                      terkait. Dengan soft delete, semua data akan tetap
                      tersimpan untuk referensi di masa depan.
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
                      <li>User akan dihapus SELAMANYA dari database</li>
                      {user.role === "guru" ? (
                        <>
                          <li>Semua jadwal, materi, tugas akan TERHAPUS</li>
                          <li>Semua nilai yang diinput akan TERHAPUS</li>
                          <li>Semua sesi presensi akan TERHAPUS</li>
                          <li>Penugasan mata pelajaran akan TERHAPUS</li>
                        </>
                      ) : (
                        <>
                          <li>Semua nilai siswa akan TERHAPUS</li>
                          <li>Semua data absensi akan TERHAPUS</li>
                          <li>Semua submission tugas akan TERHAPUS</li>
                          <li>Riwayat kelas akan HILANG</li>
                        </>
                      )}
                      <li>Data TIDAK DAPAT dipulihkan kembali</li>
                    </ul>
                  </div>
                </div>
              </div>

              {!isSafeToDelete && userStats && (
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-300 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-orange-800">
                      <p className="font-semibold mb-2">
                        User ini TIDAK aman untuk dihapus!
                      </p>
                      <p>
                        Ada {userStats.totalRelasi || 0} data terkait yang akan
                        terhapus. Pertimbangkan untuk:
                      </p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Backup data penting sebelum menghapus</li>
                        <li>Transfer data ke user lain jika memungkinkan</li>
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
                    Anda yakin ingin menghapus permanen user{" "}
                    <span className="font-bold">{user.name}</span>?
                  </p>
                  <p className="text-center text-red-400 text-xs">
                    Tindakan ini tidak dapat dibatalkan!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* User Information */}
          {userStats?.user && (
            <div className="bg-gradient-to-br from-gray-50 to-slate-50 border border-neutral-border rounded-lg p-4">
              <h4 className="font-semibold text-neutral-text mb-3">
                Informasi User
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-secondary">Email:</span>
                  <span className="font-medium text-neutral-text">
                    {userStats.user.email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-secondary">
                    {user.role === "guru" ? "NIP:" : "NISN:"}
                  </span>
                  <span className="font-medium text-neutral-text">
                    {userStats.user.identifier}
                  </span>
                </div>
                {user.role === "siswa" && userStats.user.kelas && (
                  <div className="flex justify-between">
                    <span className="text-neutral-secondary">Kelas:</span>
                    <span className="font-medium text-neutral-text">
                      {userStats.user.kelas.nama || "-"}
                    </span>
                  </div>
                )}
                {user.role === "guru" &&
                  userStats.user.mataPelajaran &&
                  userStats.user.mataPelajaran.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <span className="text-neutral-secondary">
                        Mata Pelajaran:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {userStats.user.mataPelajaran.map((mapel) => (
                          <span
                            key={mapel._id}
                            className="px-2 py-1 bg-[#00a3d4]/10 text-[#005f8b] rounded text-xs font-medium"
                          >
                            {mapel.nama}
                          </span>
                        ))}
                      </div>
                    </div>
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
                  Nonaktifkan User
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
