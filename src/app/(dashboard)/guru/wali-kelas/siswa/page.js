"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Loader2, Search, Info } from "lucide-react";
import Card from "@/components/ui/Card";
import { guruService } from "@/services/guru.service";
import { showToast } from "@/lib/toast";

export default function SiswaWaliKelasPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [siswaList, setSiswaList] = useState([]);
  const [kelasInfo, setKelasInfo] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchSiswa = async () => {
      setIsLoading(true);
      try {
        const response = await guruService.getSiswaWaliKelas();
        setSiswaList(response.siswa || []);
        setKelasInfo(response.kelas || null);
      } catch (error) {
        showToast.error(
          error.response?.data?.message || "Gagal memuat data siswa"
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchSiswa();
  }, []);

  const filteredSiswa = siswaList.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.identifier?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00a3d4] to-[#005f8b] flex items-center justify-center shadow-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-text">
              Siswa Perwalian
            </h1>
            <p className="text-neutral-secondary mt-1">
              {kelasInfo
                ? `Daftar siswa di kelas perwalian Anda: ${kelasInfo.nama}`
                : "Daftar siswa di kelas perwalian Anda"}
            </p>
          </div>
        </div>
      </motion.div>

      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Daftar Siswa</h2>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-secondary" />
            <input
              type="text"
              placeholder="Cari nama atau NIS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-main" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <motion.table
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="w-full text-left"
            >
              <thead className="bg-neutral-surface">
                <tr>
                  <th className="px-4 py-3 text-sm font-semibold">No</th>
                  <th className="px-4 py-3 text-sm font-semibold">
                    Nama Siswa
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold">NIS</th>
                  <th className="px-4 py-3 text-sm font-semibold">Email</th>
                </tr>
              </thead>
              <tbody>
                {filteredSiswa.length > 0 ? (
                  filteredSiswa.map((siswa, index) => (
                    <motion.tr
                      key={siswa._id}
                      variants={itemVariants}
                      className="border-b border-neutral-border hover:bg-neutral-surface"
                    >
                      <td className="px-4 py-3">{index + 1}</td>
                      <td className="px-4 py-3 font-medium text-neutral-text">
                        {siswa.name}
                      </td>
                      <td className="px-4 py-3 text-neutral-secondary">
                        {siswa.identifier}
                      </td>
                      <td className="px-4 py-3 text-neutral-secondary">
                        {siswa.email || "-"}
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-16">
                      <Info className="w-12 h-12 mx-auto text-neutral-disabled mb-2" />
                      <p className="font-medium">
                        {searchTerm
                          ? "Siswa tidak ditemukan"
                          : "Tidak ada siswa"}
                      </p>
                      <p className="text-sm text-neutral-secondary">
                        {searchTerm
                          ? "Coba kata kunci lain."
                          : "Belum ada siswa di kelas perwalian Anda."}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </motion.table>
          </div>
        )}
      </Card>
    </div>
  );
}
