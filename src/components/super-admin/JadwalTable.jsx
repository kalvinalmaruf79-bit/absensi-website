// src/components/super-admin/JadwalTable.jsx
"use client";

import { motion } from "framer-motion";
import { Eye, Trash2, RotateCcw, Calendar } from "lucide-react";

const hariMapping = {
  senin: "Senin",
  selasa: "Selasa",
  rabu: "Rabu",
  kamis: "Kamis",
  jumat: "Jumat",
  sabtu: "Sabtu",
};

export default function JadwalTable({ data, onDelete, onRestore, onView }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-neutral-surface border-b border-neutral-border">
            <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-text">
              Hari
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-text">
              Waktu
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-text">
              Kelas
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-text">
              Mata Pelajaran
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-text">
              Guru
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-text">
              Semester
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-text">
              Status
            </th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-neutral-text">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((jadwal, index) => (
            <motion.tr
              key={jadwal._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border-b border-neutral-border hover:bg-neutral-surface/50 transition-colors"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-neutral-secondary" />
                  <span className="text-sm font-medium text-neutral-text">
                    {hariMapping[jadwal.hari] || jadwal.hari}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-neutral-text font-mono">
                  {jadwal.jamMulai} - {jadwal.jamSelesai}
                </span>
              </td>
              <td className="px-6 py-4">
                <div>
                  <div className="text-sm font-medium text-neutral-text">
                    {jadwal.kelas?.nama || "-"}
                  </div>
                  <div className="text-xs text-neutral-secondary">
                    {jadwal.kelas?.tingkat} {jadwal.kelas?.jurusan}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div>
                  <div className="text-sm font-medium text-neutral-text">
                    {jadwal.mataPelajaran?.nama || "-"}
                  </div>
                  <div className="text-xs text-neutral-secondary">
                    {jadwal.mataPelajaran?.kode}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div>
                  <div className="text-sm font-medium text-neutral-text">
                    {jadwal.guru?.name || "-"}
                  </div>
                  <div className="text-xs text-neutral-secondary">
                    {jadwal.guru?.identifier}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div>
                  <div className="text-sm font-medium text-neutral-text capitalize">
                    {jadwal.semester}
                  </div>
                  <div className="text-xs text-neutral-secondary">
                    {jadwal.tahunAjaran}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    jadwal.isActive
                      ? "bg-success/10 text-success"
                      : "bg-neutral-light/50 text-neutral-secondary"
                  }`}
                >
                  {jadwal.isActive ? "Aktif" : "Nonaktif"}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                  {jadwal.isActive ? (
                    <>
                      <button
                        onClick={() => onView(jadwal)}
                        className="p-2 text-[#00a3d4] hover:bg-[#00a3d4]/10 rounded-lg transition-colors"
                        title="Lihat Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(jadwal)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => onView(jadwal)}
                        className="p-2 text-[#00a3d4] hover:bg-[#00a3d4]/10 rounded-lg transition-colors"
                        title="Lihat Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onRestore(jadwal._id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Aktifkan Kembali"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </>
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
