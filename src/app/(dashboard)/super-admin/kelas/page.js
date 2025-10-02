// src/app/(dashboard)/super-admin/kelas/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  GraduationCap,
  Archive,
} from "lucide-react";
import KelasTable from "@/components/super-admin/KelasTable";
import DeleteKelasModal from "@/components/super-admin/DeleteKelasModal";
import { superAdminService } from "@/services/super-admin.service";
import { showToast } from "@/lib/toast";

export default function KelasPage() {
  const router = useRouter();
  const [kelas, setKelas] = useState([]);
  const [filteredKelas, setFilteredKelas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTingkat, setFilterTingkat] = useState("");
  const [filterTahunAjaran, setFilterTahunAjaran] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  // Modal states
  const [selectedKelas, setSelectedKelas] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    aktif: 0,
    nonaktif: 0,
    totalSiswa: 0,
  });

  useEffect(() => {
    fetchKelas();
  }, [showInactive]);

  useEffect(() => {
    filterData();
  }, [searchTerm, filterTingkat, filterTahunAjaran, kelas]);

  const fetchKelas = async () => {
    try {
      setIsLoading(true);
      const response = await superAdminService.getAllKelas({
        includeInactive: showInactive,
      });

      let kelasData = [];
      if (response.success && Array.isArray(response.data)) {
        kelasData = response.data;
      } else if (Array.isArray(response)) {
        kelasData = response;
      } else if (response.data && Array.isArray(response.data)) {
        kelasData = response.data;
      }

      const transformedData = kelasData.map((item) => ({
        ...item,
        jumlahSiswa: item.siswa?.length || 0,
        kode:
          item.kode ||
          `${item.tingkat}-${item.jurusan
            ?.substring(0, 3)
            .toUpperCase()}-${item.nama.split(" ").pop()}`,
      }));

      setKelas(transformedData);
      calculateStats(transformedData);
    } catch (error) {
      console.error("Error fetching kelas:", error);
      showToast.error(
        error.response?.data?.message ||
          "Gagal memuat data kelas. Silakan coba lagi."
      );
      setKelas([]);
      setFilteredKelas([]);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data) => {
    const total = data.length;
    const aktif = data.filter((k) => k.isActive).length;
    const nonaktif = data.filter((k) => !k.isActive).length;
    const totalSiswa = data.reduce((sum, k) => sum + (k.jumlahSiswa || 0), 0);

    setStats({
      total,
      aktif,
      nonaktif,
      totalSiswa,
    });
  };

  const filterData = () => {
    let filtered = [...kelas];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((k) => {
        const nama = k.nama?.toLowerCase() || "";
        const jurusan = k.jurusan?.toLowerCase() || "";
        const waliKelasName = k.waliKelas?.name?.toLowerCase() || "";
        const waliKelasNip = k.waliKelas?.identifier?.toLowerCase() || "";

        return (
          nama.includes(searchLower) ||
          jurusan.includes(searchLower) ||
          waliKelasName.includes(searchLower) ||
          waliKelasNip.includes(searchLower)
        );
      });
    }

    if (filterTingkat) {
      filtered = filtered.filter((k) => k.tingkat === filterTingkat);
    }

    if (filterTahunAjaran) {
      filtered = filtered.filter((k) => k.tahunAjaran === filterTahunAjaran);
    }

    setFilteredKelas(filtered);
  };

  const handleDeleteClick = (kelasData) => {
    setSelectedKelas(kelasData);
    setShowDeleteModal(true);
  };

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false);
    setSelectedKelas(null);
    fetchKelas();
  };

  const handleRestore = async (id) => {
    try {
      const response = await superAdminService.restoreKelas(id);

      if (response.success) {
        showToast.success(
          response.message || "Kelas berhasil diaktifkan kembali"
        );
        fetchKelas();
      } else {
        showToast.error(response.message || "Gagal mengaktifkan kelas");
      }
    } catch (error) {
      console.error("Error restoring kelas:", error);
      showToast.error(
        error.response?.data?.message ||
          "Gagal mengaktifkan kelas. Silakan coba lagi."
      );
    }
  };

  const handleView = (kelasData) => {
    router.push(`/super-admin/kelas/${kelasData._id}`);
  };

  const getTahunAjaranOptions = () => {
    const uniqueTahunAjaran = [...new Set(kelas.map((k) => k.tahunAjaran))];
    return uniqueTahunAjaran.sort().reverse();
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00a3d4] to-[#005f8b] flex items-center justify-center shadow-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-text">
                Manajemen Kelas
              </h1>
              <p className="text-neutral-secondary mt-1">
                Kelola data kelas dan wali kelas
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchKelas}
              disabled={isLoading}
              className="px-4 py-2 border border-neutral-border text-neutral-text rounded-lg hover:bg-neutral-surface transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw
                className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <button
              onClick={() => router.push("/super-admin/kelas/create")}
              className="px-6 py-2 bg-gradient-to-br from-[#00a3d4] to-[#005f8b] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 font-semibold shadow-md"
            >
              <Plus className="w-5 h-5" />
              Tambah Kelas Baru
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"
      >
        <div className="bg-white rounded-lg shadow-soft p-6 border border-neutral-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-secondary">Total Kelas</p>
              <p className="text-3xl font-bold text-neutral-text mt-2">
                {stats.total}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <GraduationCap className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-soft p-6 border border-neutral-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-secondary">Kelas Aktif</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {stats.aktif}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <GraduationCap className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-soft p-6 border border-neutral-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-secondary">Kelas Nonaktif</p>
              <p className="text-3xl font-bold text-gray-600 mt-2">
                {stats.nonaktif}
              </p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <Archive className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-soft p-6 border border-neutral-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-secondary">Total Siswa</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {stats.totalSiswa}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <GraduationCap className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-soft p-6 mb-6 border border-neutral-border"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-neutral-secondary" />
            <h3 className="text-lg font-semibold text-neutral-text">
              Filter & Pencarian
            </h3>
          </div>

          {/* Toggle Show Inactive */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-neutral-text">
              Tampilkan Kelas Nonaktif
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-secondary" />
            <input
              type="text"
              placeholder="Cari kelas, jurusan, atau wali kelas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a3d4] focus:border-[#00a3d4]"
            />
          </div>

          {/* Filter Tingkat */}
          <select
            value={filterTingkat}
            onChange={(e) => setFilterTingkat(e.target.value)}
            className="px-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a3d4] focus:border-[#00a3d4] bg-white"
          >
            <option value="">Semua Tingkat</option>
            <option value="X">Kelas X</option>
            <option value="XI">Kelas XI</option>
            <option value="XII">Kelas XII</option>
          </select>

          {/* Filter Tahun Ajaran */}
          <select
            value={filterTahunAjaran}
            onChange={(e) => setFilterTahunAjaran(e.target.value)}
            className="px-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a3d4] focus:border-[#00a3d4] bg-white"
          >
            <option value="">Semua Tahun Ajaran</option>
            {getTahunAjaranOptions().map((ta) => (
              <option key={ta} value={ta}>
                {ta}
              </option>
            ))}
          </select>
        </div>

        {/* Active Filters Display */}
        {(searchTerm || filterTingkat || filterTahunAjaran) && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-neutral-secondary">
              Filter aktif:
            </span>
            {searchTerm && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                Pencarian: {searchTerm}
                <button
                  onClick={() => setSearchTerm("")}
                  className="ml-2 hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            {filterTingkat && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                Tingkat: {filterTingkat}
                <button
                  onClick={() => setFilterTingkat("")}
                  className="ml-2 hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            {filterTahunAjaran && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                TA: {filterTahunAjaran}
                <button
                  onClick={() => setFilterTahunAjaran("")}
                  className="ml-2 hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterTingkat("");
                setFilterTahunAjaran("");
              }}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Reset semua filter
            </button>
          </div>
        )}
      </motion.div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-neutral-secondary">
          Menampilkan{" "}
          <span className="font-semibold">{filteredKelas.length}</span> dari{" "}
          <span className="font-semibold">{stats.total}</span> kelas
          {showInactive && (
            <span className="ml-2 text-gray-500">(termasuk nonaktif)</span>
          )}
        </p>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg shadow-soft border border-neutral-border"
      >
        <KelasTable
          data={filteredKelas}
          onDelete={handleDeleteClick}
          onRestore={handleRestore}
          onView={handleView}
          isLoading={isLoading}
        />
      </motion.div>

      {/* Delete Modal */}
      {showDeleteModal && selectedKelas && (
        <DeleteKelasModal
          kelas={selectedKelas}
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedKelas(null);
          }}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
}
