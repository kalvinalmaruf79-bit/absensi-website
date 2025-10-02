// src/app/(dashboard)/super-admin/mata-pelajaran/page.js
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
  BookOpen,
  Loader2,
} from "lucide-react";
import MataPelajaranTable from "@/components/super-admin/MataPelajaranTable";
import MataPelajaranFormModal from "@/components/super-admin/MataPelajaranFormModal";
import AssignGuruModal from "@/components/super-admin/AssignGuruModal";
import DeleteMataPelajaranModal from "@/components/super-admin/DeleteMataPelajaranModal";
import Pagination from "@/components/shared/Pagination";
import EmptyState from "@/components/shared/EmptyState";
import { superAdminService } from "@/services/super-admin.service";
import { showToast } from "@/lib/toast";
import Card from "@/components/ui/Card";

export default function MataPelajaranPage() {
  const router = useRouter();
  const [mataPelajaran, setMataPelajaran] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Tambah state untuk trigger refresh

  const [filters, setFilters] = useState({
    search: "",
    isActive: "true",
    page: 1,
    limit: 10,
  });

  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalDocs: 0,
  });

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMapel, setSelectedMapel] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMataPelajaran = useCallback(async (currentFilters) => {
    setIsLoading(true);
    try {
      const response = await superAdminService.getAllMataPelajaran(
        currentFilters
      );
      setMataPelajaran(response.docs || []);
      setPagination({
        totalPages: response.totalPages || 1,
        totalDocs: response.totalDocs || 0,
        page: response.page,
        limit: response.limit,
      });
    } catch (error) {
      console.error("Error fetching mata pelajaran:", error);
      showToast.error("Gagal memuat data mata pelajaran");
      setMataPelajaran([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debouncedSearch = useMemo(
    () =>
      debounce((searchValue) => {
        setFilters((prev) => ({ ...prev, page: 1, search: searchValue }));
      }, 500),
    []
  );

  // Fetch data saat filters atau refreshTrigger berubah
  useEffect(() => {
    fetchMataPelajaran(filters);
  }, [filters, fetchMataPelajaran, refreshTrigger]);

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

  const handleCreateClick = () => {
    setSelectedMapel(null);
    setShowFormModal(true);
  };

  const handleEditClick = (mapel) => {
    setSelectedMapel(mapel);
    setShowFormModal(true);
  };

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (selectedMapel) {
        await superAdminService.updateMataPelajaran(selectedMapel._id, data);
        showToast.success("Mata pelajaran berhasil diperbarui");
      } else {
        await superAdminService.createMataPelajaran(data);
        showToast.success("Mata pelajaran berhasil dibuat");
      }
      setShowFormModal(false);
      setSelectedMapel(null);
      // Trigger refresh dengan increment counter
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      showToast.error(error.response?.data?.message || "Gagal menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (mapel) => {
    setSelectedMapel(mapel);
    setShowDeleteModal(true);
  };

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false);
    setSelectedMapel(null);
    // Trigger refresh dengan increment counter
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleAssignGuruClick = (mapel) => {
    setSelectedMapel(mapel);
    setShowAssignModal(true);
  };

  const handleRestore = async (id) => {
    try {
      const response = await superAdminService.restoreMataPelajaran(id);
      showToast.success(
        response.message || "Mata pelajaran berhasil diaktifkan kembali"
      );
      // Trigger refresh dengan increment counter
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      showToast.error(
        error.response?.data?.message || "Gagal mengaktifkan mata pelajaran"
      );
    }
  };

  const handleView = (mapel) => {
    router.push(`/super-admin/mata-pelajaran/${mapel._id}`);
  };

  const handleRefresh = () => {
    // Trigger refresh dengan increment counter
    setRefreshTrigger((prev) => prev + 1);
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
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-text">
                Manajemen Mata Pelajaran
              </h1>
              <p className="text-neutral-secondary mt-1">
                Total {pagination.totalDocs} mata pelajaran terdaftar
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-4 py-2 border border-neutral-border text-neutral-text rounded-lg hover:bg-neutral-surface transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw
                className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <button
              onClick={handleCreateClick}
              className="px-6 py-2 bg-gradient-to-br from-[#00a3d4] to-[#005f8b] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 font-semibold shadow-md"
            >
              <Plus className="w-5 h-5" />
              Tambah Mata Pelajaran
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-secondary" />
            <input
              type="text"
              placeholder="Cari nama mata pelajaran atau kode..."
              className="w-full pl-10 pr-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main"
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>
        </Card>
      </motion.div>

      {/* Table */}
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
          ) : mataPelajaran.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="w-16 h-16 text-neutral-secondary" />}
              title="Tidak Ada Data Mata Pelajaran"
              description={
                filters.search
                  ? "Tidak ada mata pelajaran yang cocok dengan pencarian Anda."
                  : "Silakan tambahkan mata pelajaran baru untuk memulai."
              }
            />
          ) : (
            <>
              <MataPelajaranTable
                data={mataPelajaran}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onRestore={handleRestore}
                onView={handleView}
                onAssignGuru={handleAssignGuruClick}
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

      {/* Modals */}
      <MataPelajaranFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setSelectedMapel(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={selectedMapel}
        isLoading={isSubmitting}
      />

      <AssignGuruModal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedMapel(null);
          // Trigger refresh setelah assign guru
          setRefreshTrigger((prev) => prev + 1);
        }}
        mataPelajaran={selectedMapel}
      />

      <DeleteMataPelajaranModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedMapel(null);
        }}
        mataPelajaran={selectedMapel}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
