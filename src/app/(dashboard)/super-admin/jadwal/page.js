// src/app/(dashboard)/super-admin/jadwal/page.js
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
  Calendar,
  Loader2,
} from "lucide-react";
import JadwalTable from "@/components/super-admin/JadwalTable";
import DeleteJadwalModal from "@/components/super-admin/DeleteJadwalModal";
import Pagination from "@/components/shared/Pagination";
import EmptyState from "@/components/shared/EmptyState";
import { superAdminService } from "@/services/super-admin.service";
import { showToast } from "@/lib/toast";
import Card from "@/components/ui/Card";

const hariOptions = [
  { value: "senin", label: "Senin" },
  { value: "selasa", label: "Selasa" },
  { value: "rabu", label: "Rabu" },
  { value: "kamis", label: "Kamis" },
  { value: "jumat", label: "Jumat" },
  { value: "sabtu", label: "Sabtu" },
];

export default function JadwalPage() {
  const router = useRouter();
  const [jadwal, setJadwal] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: "",
    hari: "",
    semester: "",
    tahunAjaran: "",
    kelasId: "",
    isActive: "true",
    page: 1,
    limit: 10,
  });

  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalDocs: 0,
  });

  const [selectedJadwal, setSelectedJadwal] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [tahunAjaranOptions, setTahunAjaranOptions] = useState([]);
  const [kelasOptions, setKelasOptions] = useState([]);

  const fetchJadwal = useCallback(async (currentFilters) => {
    setIsLoading(true);
    try {
      const response = await superAdminService.getAllJadwal(currentFilters);
      if (response) {
        setJadwal(response.docs || []);
        setPagination({
          totalPages: response.totalPages || 1,
          totalDocs: response.totalDocs || 0,
          page: response.page,
          limit: response.limit,
        });
      }
    } catch (error) {
      console.error("Error fetching jadwal:", error);
      showToast.error(
        error.response?.data?.message ||
          "Gagal memuat data jadwal. Silakan coba lagi."
      );
      setJadwal([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [jadwalRes, kelasRes] = await Promise.all([
          superAdminService.getAllJadwal({ limit: 1000 }),
          superAdminService.getAllKelas({ limit: 1000, isActive: true }),
        ]);

        if (jadwalRes) {
          const uniqueTahun = [
            ...new Set(jadwalRes.docs.map((j) => j.tahunAjaran)),
          ];
          setTahunAjaranOptions(uniqueTahun.sort().reverse());
        }

        if (kelasRes.success) {
          setKelasOptions(kelasRes.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch filter options", error);
      }
    };
    fetchOptions();
  }, []);

  const debouncedSearch = useMemo(
    () =>
      debounce((searchValue) => {
        setFilters((prev) => ({ ...prev, page: 1, search: searchValue }));
      }, 500),
    []
  );

  useEffect(() => {
    fetchJadwal(filters);
  }, [filters, fetchJadwal]);

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

  const handleDeleteClick = (jadwalData) => {
    setSelectedJadwal(jadwalData);
    setShowDeleteModal(true);
  };

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false);
    setSelectedJadwal(null);
    fetchJadwal(filters);
  };

  const handleRestore = async (id) => {
    try {
      const response = await superAdminService.restoreJadwal(id);
      if (response.success) {
        showToast.success(
          response.message || "Jadwal berhasil diaktifkan kembali"
        );
        fetchJadwal(filters);
      } else {
        showToast.error(response.message || "Gagal mengaktifkan jadwal");
      }
    } catch (error) {
      console.error("Error restoring jadwal:", error);
      showToast.error(
        error.response?.data?.message ||
          "Gagal mengaktifkan jadwal. Silakan coba lagi."
      );
    }
  };

  const handleView = (jadwalData) => {
    router.push(`/super-admin/jadwal/${jadwalData._id}`);
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00a3d4] to-[#005f8b] flex items-center justify-center shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-text">
                Manajemen Jadwal
              </h1>
              <p className="text-neutral-secondary mt-1">
                Total {pagination.totalDocs} jadwal terdaftar
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => fetchJadwal(filters)}
              disabled={isLoading}
              className="px-4 py-2 border border-neutral-border text-neutral-text rounded-lg hover:bg-neutral-surface transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw
                className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <button
              onClick={() => router.push("/super-admin/jadwal/create")}
              className="px-6 py-2 bg-gradient-to-br from-[#00a3d4] to-[#005f8b] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 font-semibold shadow-md"
            >
              <Plus className="w-5 h-5" />
              Tambah Jadwal
            </button>
          </div>
        </div>
      </motion.div>

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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-secondary" />
              <input
                type="text"
                placeholder="Cari mata pelajaran, guru, kelas..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main"
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>
            <select
              value={filters.hari}
              onChange={(e) => handleFilterChange("hari", e.target.value)}
              className="px-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main bg-white"
            >
              <option value="">Semua Hari</option>
              {hariOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={filters.kelasId}
              onChange={(e) => handleFilterChange("kelasId", e.target.value)}
              className="px-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main bg-white"
            >
              <option value="">Semua Kelas</option>
              {kelasOptions.map((kelas) => (
                <option key={kelas._id} value={kelas._id}>
                  {kelas.nama}
                </option>
              ))}
            </select>
            <select
              value={filters.semester}
              onChange={(e) => handleFilterChange("semester", e.target.value)}
              className="px-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main bg-white"
            >
              <option value="">Semua Semester</option>
              <option value="ganjil">Ganjil</option>
              <option value="genap">Genap</option>
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
          ) : jadwal.length === 0 ? (
            <EmptyState
              icon={<Calendar className="w-16 h-16 text-neutral-secondary" />}
              title="Tidak Ada Data Jadwal"
              description={
                Object.values(filters).some((v) => v && v !== "true")
                  ? "Tidak ada jadwal yang cocok dengan filter Anda."
                  : "Silakan buat jadwal baru untuk memulai."
              }
            />
          ) : (
            <>
              <JadwalTable
                data={jadwal}
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

      {showDeleteModal && selectedJadwal && (
        <DeleteJadwalModal
          jadwal={selectedJadwal}
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedJadwal(null);
          }}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
}
