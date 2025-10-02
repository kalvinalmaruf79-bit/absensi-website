// src/components/super-admin/MataPelajaranTable.jsx
"use client";

import { motion } from "framer-motion";
import {
  Edit,
  Trash2,
  Eye,
  UserPlus,
  Users,
  BookOpen,
  Archive,
  RotateCcw,
} from "lucide-react";

export default function MataPelajaranTable({
  data,
  onEdit,
  onDelete,
  onRestore,
  onView,
  onAssignGuru,
}) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-neutral-border">
            <th className="text-left py-4 px-4 text-sm font-semibold text-neutral-text">
              Kode
            </th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-neutral-text">
              Nama Mata Pelajaran
            </th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-neutral-text">
              Deskripsi
            </th>
            <th className="text-center py-4 px-4 text-sm font-semibold text-neutral-text">
              Jumlah Guru
            </th>
            <th className="text-center py-4 px-4 text-sm font-semibold text-neutral-text">
              Status
            </th>
            <th className="text-center py-4 px-4 text-sm font-semibold text-neutral-text">
              Aksi
            </th>
          </tr>
        </thead>
        <motion.tbody
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {data.map((mapel) => (
            <motion.tr
              key={mapel._id}
              variants={rowVariants}
              className="border-b border-neutral-border hover:bg-neutral-surface/30 transition-colors"
            >
              <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-main to-primary-darkest flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-neutral-text">
                    {mapel.kode}
                  </span>
                </div>
              </td>
              <td className="py-4 px-4">
                <div>
                  <p className="font-medium text-neutral-text">{mapel.nama}</p>
                  <p className="text-sm text-neutral-secondary mt-1">
                    Dibuat oleh: {mapel.createdBy?.name || "Sistem"}
                  </p>
                </div>
              </td>
              <td className="py-4 px-4">
                <p className="text-sm text-neutral-secondary line-clamp-2">
                  {mapel.deskripsi || "-"}
                </p>
              </td>
              <td className="py-4 px-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Users className="w-4 h-4 text-neutral-secondary" />
                  <span className="font-semibold text-neutral-text">
                    {mapel.jumlahGuru || 0}
                  </span>
                </div>
              </td>
              <td className="py-4 px-4 text-center">
                {mapel.isActive ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                    Aktif
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-light/30 text-neutral-secondary text-sm font-medium">
                    <Archive className="w-3.5 h-3.5" />
                    Nonaktif
                  </span>
                )}
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center justify-center gap-2">
                  {/* Tombol Lihat Detail */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onView(mapel)}
                    className="p-2 rounded-lg bg-info/10 text-info hover:bg-info/20 transition-colors"
                    title="Lihat Detail"
                  >
                    <Eye className="w-4 h-4" />
                  </motion.button>

                  {mapel.isActive && (
                    <>
                      {/* Tombol Edit - DITAMBAHKAN */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onEdit(mapel)}
                        className="p-2 rounded-lg bg-warning/10 text-warning hover:bg-warning/20 transition-colors"
                        title="Edit Mata Pelajaran"
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>

                      {/* Tombol Kelola Guru */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onAssignGuru(mapel)}
                        className="p-2 rounded-lg bg-primary-main/10 text-primary-main hover:bg-primary-main/20 transition-colors"
                        title="Kelola Guru"
                      >
                        <UserPlus className="w-4 h-4" />
                      </motion.button>

                      {/* Tombol Nonaktifkan */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onDelete(mapel)}
                        className="p-2 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-colors"
                        title="Nonaktifkan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </>
                  )}

                  {/* Tombol Restore untuk yang nonaktif */}
                  {!mapel.isActive && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onRestore(mapel._id)}
                      className="p-2 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors"
                      title="Aktifkan Kembali"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>
              </td>
            </motion.tr>
          ))}
        </motion.tbody>
      </table>
    </div>
  );
}
