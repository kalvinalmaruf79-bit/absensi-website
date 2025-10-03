// src/components/super-admin/UserTable.jsx
"use client";

import { motion } from "framer-motion";
import { Edit, Trash2, RotateCcw } from "lucide-react";

export default function UserTable({
  users,
  onEdit,
  onDelete,
  onRestore,
  loading,
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#00a3d4]/20 border-t-[#00a3d4] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-secondary">Tidak ada data user</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-neutral-border bg-gray-50">
            <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-text">
              User
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-text">
              Role
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-text">
              NIP/NISN
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-text">
              Kelas/Mapel
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-text">
              Status
            </th>
            <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-text">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-border">
          {users.map((user, index) => (
            <motion.tr
              key={user._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="hover:bg-gray-50 transition-colors"
            >
              {/* User Info */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00a3d4] to-[#005f8b] flex items-center justify-center text-white font-semibold shadow">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-neutral-text">
                      {user.name}
                    </div>
                    <div className="text-sm text-neutral-secondary">
                      {user.email}
                    </div>
                  </div>
                </div>
              </td>

              {/* Role */}
              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === "guru"
                      ? "bg-[#00a3d4]/10 text-[#005f8b]"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {user.role === "guru" ? "Guru" : "Siswa"}
                </span>
              </td>

              {/* Identifier */}
              <td className="px-6 py-4">
                <span className="text-sm text-neutral-text font-mono">
                  {user.identifier}
                </span>
              </td>

              {/* Kelas/Mapel */}
              <td className="px-6 py-4">
                {user.role === "siswa" ? (
                  <span className="text-sm text-neutral-text">
                    {user.kelas?.nama || "-"}
                  </span>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {user.mataPelajaran && user.mataPelajaran.length > 0 ? (
                      user.mataPelajaran.slice(0, 2).map((mapel) => (
                        <span
                          key={mapel._id}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
                        >
                          {mapel.kode || mapel.nama}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-neutral-secondary">-</span>
                    )}
                    {user.mataPelajaran && user.mataPelajaran.length > 2 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                        +{user.mataPelajaran.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </td>

              {/* Status */}
              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      user.isActive ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></span>
                  {user.isActive ? "Aktif" : "Nonaktif"}
                </span>
              </td>

              {/* Actions */}
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  {user.isActive ? (
                    <>
                      <button
                        onClick={() => onEdit(user)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#00a3d4] hover:bg-[#00a3d4]/10 rounded-lg transition-colors"
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => onDelete(user)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus User"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Hapus</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => onRestore(user)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Restore User"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Restore</span>
                    </button>
                  )}
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
