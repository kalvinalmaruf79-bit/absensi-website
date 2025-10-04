// src/app/(dashboard)/guru/wali-kelas/rapor/page.js
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Loader2, Download, Search, Filter } from "lucide-react";
import Card from "@/components/ui/Card";
import { akademikService } from "@/services/akademik.service";
import { showToast } from "@/lib/toast";

export default function RaporWaliKelasPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [siswaList, setSiswaList] = useState([]);
  const [selectedSiswa, setSelectedSiswa] = useState(null);
  const [rapor, setRapor] = useState(null);
  const [tahunAjaran, setTahunAjaran] = useState("");
  const [semester, setSemester] = useState("ganjil");
  const [filters, setFilters] = useState({
    search: "",
  });

  // Load siswa di kelas wali kelas
  useEffect(() => {
    fetchSiswa();
  }, []);

  const fetchSiswa = async () => {
    setIsLoading(true);
    try {
      // Asumsi: endpoint untuk get siswa di kelas wali kelas
      // Sesuaikan dengan endpoint yang tersedia
      const response = await fetch("/api/guru/wali-kelas/siswa");
      const data = await response.json();
      if (data.success) {
        setSiswaList(data.data || []);
      }
    } catch (error) {
      showToast.error("Gagal memuat data siswa");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateRapor = async () => {
    if (!selectedSiswa || !tahunAjaran || !semester) {
      showToast.error("Pilih siswa, tahun ajaran, dan semester");
      return;
    }

    setIsLoading(true);
    try {
      const response = await akademikService.generateRapor(selectedSiswa._id, {
        tahunAjaran,
        semester,
      });

      setRapor(response);
      showToast.success("Rapor berhasil dibuat");
    } catch (error) {
      showToast.error(error.response?.data?.message || "Gagal membuat rapor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadRapor = () => {
    if (!rapor) return;

    // Convert rapor to downloadable format (PDF/Excel)
    // Implementasi download sesuai kebutuhan
    showToast.info("Fitur download sedang dalam pengembangan");
  };

  const filteredSiswa = siswaList.filter(
    (s) =>
      s.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      s.identifier?.toLowerCase().includes(filters.search.toLowerCase())
  );

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
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-text">
              Rapor Siswa
            </h1>
            <p className="text-neutral-secondary mt-1">
              Generate dan lihat rapor siswa di kelas Anda
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar: Pilih Siswa */}
        <Card className="lg:col-span-1">
          <h2 className="text-lg font-bold mb-4">Pilih Siswa</h2>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-secondary" />
            <input
              type="text"
              placeholder="Cari nama atau NIS..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="w-full pl-10 pr-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main"
            />
          </div>

          {/* Siswa List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredSiswa.map((siswa) => (
              <button
                key={siswa._id}
                onClick={() => setSelectedSiswa(siswa)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedSiswa?._id === siswa._id
                    ? "border-primary-main bg-primary-surface"
                    : "border-neutral-border hover:border-primary-main"
                }`}
              >
                <p className="font-medium text-neutral-text">{siswa.name}</p>
                <p className="text-sm text-neutral-secondary">
                  NIS: {siswa.identifier}
                </p>
              </button>
            ))}
          </div>
        </Card>

        {/* Main Content: Form & Rapor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Form Generate */}
          <Card>
            <h2 className="text-lg font-bold mb-4">Generate Rapor</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tahun Ajaran
                </label>
                <input
                  type="text"
                  placeholder="2024/2025"
                  value={tahunAjaran}
                  onChange={(e) => setTahunAjaran(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Semester
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main"
                >
                  <option value="ganjil">Ganjil</option>
                  <option value="genap">Genap</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleGenerateRapor}
                  disabled={isLoading || !selectedSiswa}
                  className="w-full py-2 bg-gradient-to-br from-[#00a3d4] to-[#005f8b] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    "Generate"
                  )}
                </button>
              </div>
            </div>

            {!selectedSiswa && (
              <p className="text-sm text-neutral-secondary text-center py-4">
                Pilih siswa terlebih dahulu
              </p>
            )}
          </Card>

          {/* Rapor Display */}
          {rapor && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Rapor Siswa</h2>
                  <button
                    onClick={handleDownloadRapor}
                    className="px-4 py-2 border border-neutral-border text-neutral-text rounded-lg hover:bg-neutral-surface transition-colors flex items-center gap-2 font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>

                {/* Informasi Siswa */}
                <div className="bg-neutral-surface p-4 rounded-lg mb-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-neutral-secondary">Nama</p>
                      <p className="font-medium">{rapor.informasiSiswa.nama}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-secondary">NIS</p>
                      <p className="font-medium">{rapor.informasiSiswa.nis}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-secondary">Kelas</p>
                      <p className="font-medium">
                        {rapor.informasiSiswa.kelas}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-secondary">
                        Wali Kelas
                      </p>
                      <p className="font-medium">
                        {rapor.informasiSiswa.waliKelas}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-neutral-border">
                    <p className="text-sm text-neutral-secondary">Periode</p>
                    <p className="font-medium">
                      {rapor.informasiSiswa.tahunAjaran} - Semester{" "}
                      {rapor.informasiSiswa.semester}
                    </p>
                  </div>
                </div>

                {/* Nilai Akademik */}
                <div className="mb-6">
                  <h3 className="font-bold mb-3">Nilai Akademik</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-neutral-surface">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold">
                            Mata Pelajaran
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-semibold">
                            Nilai
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">
                            Deskripsi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-border">
                        {rapor.nilaiAkademik.map((nilai, idx) => (
                          <tr key={idx} className="hover:bg-neutral-surface">
                            <td className="px-4 py-3">
                              <p className="font-medium">
                                {nilai.mataPelajaran}
                              </p>
                              <p className="text-xs text-neutral-secondary">
                                {nilai.kodeMapel}
                              </p>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`inline-block px-3 py-1 rounded-full font-semibold ${
                                  nilai.nilai >= 85
                                    ? "bg-green-100 text-green-700"
                                    : nilai.nilai >= 75
                                    ? "bg-blue-100 text-blue-700"
                                    : nilai.nilai >= 65
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {nilai.nilai}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {nilai.deskripsi || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Rekap Absensi */}
                <div className="bg-neutral-surface p-4 rounded-lg mb-4">
                  <h3 className="font-bold mb-3">Rekap Absensi</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {rapor.rekapAbsensi.hadir}
                      </p>
                      <p className="text-sm text-neutral-secondary">Hadir</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {rapor.rekapAbsensi.sakit}
                      </p>
                      <p className="text-sm text-neutral-secondary">Sakit</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">
                        {rapor.rekapAbsensi.izin}
                      </p>
                      <p className="text-sm text-neutral-secondary">Izin</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">
                        {rapor.rekapAbsensi.alpa}
                      </p>
                      <p className="text-sm text-neutral-secondary">Alpa</p>
                    </div>
                  </div>
                </div>

                {/* Catatan Wali Kelas */}
                {rapor.catatanWaliKelas && (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      Catatan Wali Kelas
                    </p>
                    <p className="text-sm text-blue-800">
                      {rapor.catatanWaliKelas}
                    </p>
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
