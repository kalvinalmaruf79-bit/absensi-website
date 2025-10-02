// src/app/(dashboard)/super-admin/kelas/page.js
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import debounce from "lodash.debounce";
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  GraduationCap,
  Archive,
  Loader2,
} from "lucide-react";
import KelasTable from "@/components/super-admin/KelasTable";
import DeleteKelasModal from "@/components/super-admin/DeleteKelasModal";
import Pagination from "@/components/shared/Pagination";
import EmptyState from "@/components/shared/EmptyState";
import { superAdminService } from "@/services/super-admin.service";
import { showToast } from "@/lib/toast";
import Card from "@/components/ui/Card";
export default function KelasPage() {
  const router = useRouter();
  const [kelas, setKelas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State terpusat untuk filter, pencarian, dan pagination
  const [filters, setFilters] = useState({
    search: "",
    tingkat: "",
    tahunAjaran: "",
    isActive: "true", // Default menampilkan yang aktif
    page: 1,
    limit: 10,
  });

  // State untuk menyimpan data pagination dari API
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalDocs: 0,
  });

  // State untuk modal
  const [selectedKelas, setSelectedKelas] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // State untuk opsi dropdown tahun ajaran
  const [tahunAjaranOptions, setTahunAjaranOptions] = useState([]);

  const fetchKelas = useCallback(async (currentFilters) => {
    setIsLoading(true);
    try {
      const response = await superAdminService.getAllKelas(currentFilters);
      if (response.success) {
        setKelas(response.data || []);
        setPagination({
          totalPages: response.totalPages || 1,
          totalDocs: response.totalData || 0,
          page: response.page,
          limit: response.limit,
        });
      } else {
        showToast.error(response.message || "Gagal memuat data.");
      }
    } catch (error) {
      console.error("Error fetching kelas:", error);
      showToast.error(
        error.response?.data?.message ||
          "Gagal memuat data kelas. Silakan coba lagi."
      );
      setKelas([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Ambil data tahun ajaran unik saat pertama kali load
  useEffect(() => {
    const fetchAllTahunAjaran = async () => {
      try {
        // Panggil API tanpa limit untuk mendapatkan semua data unik
        const response = await superAdminService.getAllKelas({ limit: 1000 });
        if (response.success) {
          const uniqueTahun = [
            ...new Set(response.data.map((k) => k.tahunAjaran)),
          ];
          setTahunAjaranOptions(uniqueTahun.sort().reverse());
        }
      } catch (error) {
        console.error("Failed to fetch tahun ajaran options", error);
      }
    };
    fetchAllTahunAjaran();
  }, []);

  // Debounce untuk input pencarian
  const debouncedSearch = useMemo(
    () =>
      debounce((searchValue) => {
        setFilters((prev) => ({ ...prev, page: 1, search: searchValue }));
      }, 500),
    []
  );

  // Efek untuk memanggil API setiap kali filter berubah
  useEffect(() => {
    fetchKelas(filters);
  }, [filters, fetchKelas]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleFilterChange = (key, value) => {
    if (key === "search") {
      debouncedSearch(value);
    } else if (key === "isActive") {
      setFilters((prev) => ({
        ...prev,
        page: 1,
        isActive: value ? "true" : "false",
      }));
    } else {
      setFilters((prev) => ({ ...prev, page: 1, [key]: value }));
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setFilters((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleDeleteClick = (kelasData) => {
    setSelectedKelas(kelasData);
    setShowDeleteModal(true);
  };

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false);
    setSelectedKelas(null);
    fetchKelas(filters);
  };

  const handleRestore = async (id) => {
    try {
      const response = await superAdminService.restoreKelas(id);
      if (response.success) {
        showToast.success(
          response.message || "Kelas berhasil diaktifkan kembali"
        );
        fetchKelas(filters);
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
                Total {pagination.totalDocs} kelas terdaftar
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => fetchKelas(filters)}
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
              Tambah Kelas
            </button>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-neutral-secondary" />
              <h3 className="text-lg font-semibold text-neutral-text">
                Filter & Pencarian
              </h3>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.isActive === "false"}
                onChange={(e) =>
                  handleFilterChange("isActive", !e.target.checked)
                }
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-neutral-text">
                Tampilkan Hanya Nonaktif
              </span>
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-secondary" />
              <input
                type="text"
                placeholder="Cari kelas, jurusan..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main"
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>
            <select
              value={filters.tingkat}
              onChange={(e) => handleFilterChange("tingkat", e.target.value)}
              className="px-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main bg-white"
            >
              <option value="">Semua Tingkat</option>
              <option value="X">Kelas X</option>
              <option value="XI">Kelas XI</option>
              <option value="XII">Kelas XII</option>
            </select>
            <select
              value={filters.tahunAjaran}
              onChange={(e) =>
                handleFilterChange("tahunAjaran", e.target.value)
              }
              className="px-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main bg-white"
            >
              <option value="">Semua Tahun Ajaran</option>
              {tahunAjaranOptions.map((ta) => (
                <option key={ta} value={ta}>
                  {ta}
                </option>
              ))}
            </select>
          </div>
        </Card>
      </motion.div>

      {/* Table and Pagination */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary-main animate-spin" />
            </div>
          ) : kelas.length === 0 ? (
            <EmptyState
              icon={
                <GraduationCap className="w-16 h-16 text-neutral-secondary" />
              }
              title="Tidak Ada Data Kelas"
              description={
                filters.search || filters.tingkat || filters.tahunAjaran
                  ? "Tidak ada kelas yang cocok dengan filter Anda."
                  : "Silakan buat kelas baru untuk memulai."
              }
            />
          ) : (
            <>
              <KelasTable
                data={kelas}
                onDelete={handleDeleteClick}
                onRestore={handleRestore}
                onView={handleView}
              />
              {pagination.totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </Card>
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
