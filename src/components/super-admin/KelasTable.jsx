// src/components/super-admin/KelasTable.jsx
"use client";

import { useState } from "react";
import {
  Pencil,
  Trash2,
  Users,
  UserCheck,
  Eye,
  AlertCircle,
  RotateCcw,
  Archive,
} from "lucide-react";
import Link from "next/link";

export default function KelasTable({
  data = [],
  onDelete,
  onView,
  onRestore,
  isLoading = false,
}) {
  const [restoreId, setRestoreId] = useState(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleRestoreClick = (id) => {
    setRestoreId(id);
  };

  const confirmRestore = async () => {
    if (!restoreId || !onRestore) {
      console.error("Restore ID atau onRestore handler tidak tersedia");
      return;
    }

    setIsRestoring(true);
    try {
      await onRestore(restoreId);
      setRestoreId(null);
    } catch (error) {
      console.error("Error saat restore:", error);
    } finally {
      setIsRestoring(false);
    }
  };

  const cancelRestore = () => {
    setRestoreId(null);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-soft p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-12 bg-gray-200 rounded w-12"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-soft p-12 text-center">
        <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500 text-lg font-medium">
          Belum ada data kelas
        </p>
        <p className="text-gray-400 text-sm mt-2">
          Klik tombol "Tambah Kelas Baru" untuk menambah data
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#00a3d4] to-[#005f8b] text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  No
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Nama Kelas
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Tingkat
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Jurusan
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Wali Kelas
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Jumlah Siswa
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Tahun Ajaran
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Status
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((kelas, index) => (
                <tr
                  key={kelas._id || index}
                  className={`hover:bg-gray-50 transition-colors ${
                    !kelas.isActive ? "bg-gray-50 opacity-75" : ""
                  }`}
                >
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                          kelas.isActive
                            ? "bg-gradient-to-br from-[#00a3d4] to-[#005f8b]"
                            : "bg-gray-400"
                        }`}
                      >
                        {kelas.nama?.substring(0, 2).toUpperCase() || "???"}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          {kelas.nama || "Nama tidak tersedia"}
                          {!kelas.isActive && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700">
                              <Archive className="w-3 h-3 mr-1" />
                              Nonaktif
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {kelas._id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Kelas {kelas.tingkat || "?"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {kelas.jurusan || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {kelas.waliKelas ? (
                      <div className="flex items-center">
                        <UserCheck className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        <div>
                          <div className="text-gray-900 font-medium">
                            {kelas.waliKelas.name || "Nama tidak tersedia"}
                          </div>
                          {kelas.waliKelas.identifier && (
                            <div className="text-xs text-gray-500">
                              NIP: {kelas.waliKelas.identifier}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-400">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        <span className="italic text-sm">Belum ditentukan</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="font-semibold">
                        {kelas.siswa?.length || 0}
                      </span>
                      <span className="text-gray-500 ml-1">siswa</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    {kelas.tahunAjaran || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {kelas.isActive ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Nonaktif
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      {kelas.isActive ? (
                        <>
                          <button
                            onClick={() => onView && onView(kelas)}
                            className="p-2 text-[#00a3d4] hover:bg-[#00a3d4]/10 rounded-lg transition-colors"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/super-admin/kelas/edit/${kelas._id}`}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => onDelete && onDelete(kelas)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => onView && onView(kelas)}
                            className="p-2 text-[#00a3d4] hover:bg-[#00a3d4]/10 rounded-lg transition-colors"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRestoreClick(kelas._id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Aktifkan Kembali"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restore Confirmation Modal */}
      {restoreId && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border-2 border-green-200 animate-scale-in">
            <div className="flex items-center justify-center w-14 h-14 mx-auto bg-gradient-to-br from-green-100 to-emerald-100 rounded-full mb-4 shadow-lg">
              <RotateCcw className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-neutral-text text-center mb-2">
              Aktifkan Kembali Kelas
            </h3>
            <p className="text-neutral-secondary text-center mb-6 text-sm">
              Apakah Anda yakin ingin mengaktifkan kembali kelas ini? Kelas akan
              muncul di daftar aktif dan dapat digunakan kembali.
            </p>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 mb-6">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-green-800">
                  Data siswa, jadwal, dan informasi kelas lainnya akan
                  dipulihkan dan dapat diakses kembali.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={cancelRestore}
                disabled={isRestoring}
                className="flex-1 px-4 py-2.5 border-2 border-neutral-border text-neutral-text rounded-lg hover:bg-white hover:shadow-md transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batal
              </button>
              <button
                onClick={confirmRestore}
                disabled={isRestoring}
                className="flex-1 px-4 py-2.5 bg-gradient-to-br from-green-600 to-green-700 text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isRestoring ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Mengaktifkan...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    Aktifkan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
    </>
  );
}
