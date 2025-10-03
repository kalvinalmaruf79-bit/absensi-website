// src/app/(dashboard)/super-admin/users/page.js
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import debounce from "lodash.debounce";
import { superAdminService } from "@/services/super-admin.service";
import { handleApiError } from "@/lib/api-helpers";
import { showToast } from "@/lib/toast";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Alert from "@/components/ui/Alert";
import UserTable from "@/components/super-admin/UserTable";
import Pagination from "@/components/shared/Pagination";
import ImportUserModal from "@/components/super-admin/ImportUserModal";
import DeleteUserModal from "@/components/super-admin/DeleteUserModal";
import { Users, Upload, Plus, Search, Loader2 } from "lucide-react";

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    role: "",
    isActive: "all", // Changed to "all" as default
    search: "",
    page: 1,
    limit: 10,
  });

  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalDocs: 0,
  });

  const [showImportModal, setShowImportModal] = useState(false);
  const [deleteModalUser, setDeleteModalUser] = useState(null);

  const fetchUsers = useCallback(async (currentFilters) => {
    setLoading(true);
    setError(null);
    try {
      // Prepare filters for API
      const apiFilters = { ...currentFilters };

      // Handle "all" option - don't send isActive parameter
      if (apiFilters.isActive === "all") {
        delete apiFilters.isActive;
      }

      const response = await superAdminService.getAllUsers(apiFilters);
      setUsers(response.docs || []);
      setPagination({
        totalPages: response.totalPages || 1,
        totalDocs: response.totalDocs || 0,
        limit: response.limit,
        page: response.page,
      });
    } catch (err) {
      const errorData = handleApiError(err);
      setError(errorData.message || "Gagal memuat data users");
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedSearch = useMemo(
    () =>
      debounce((searchValue) => {
        setFilters((prev) => ({ ...prev, page: 1, search: searchValue }));
      }, 500),
    []
  );

  useEffect(() => {
    fetchUsers(filters);
  }, [filters, fetchUsers]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleEdit = (user) => {
    router.push(`/super-admin/users/${user._id}`);
  };

  const handleDeleteClick = (user) => {
    setDeleteModalUser(user);
  };

  const handleDeleteSuccess = () => {
    setDeleteModalUser(null);
    fetchUsers(filters);
  };

  const handleRestore = async (user) => {
    try {
      const response = await superAdminService.restoreUser(user._id);
      if (response.success) {
        showToast.success(`User ${user.name} berhasil diaktifkan kembali`);
        fetchUsers(filters);
      }
    } catch (err) {
      const errorData = handleApiError(err);
      showToast.error(errorData.message || "Gagal mengaktifkan user");
    }
  };

  const handleImport = async (file) => {
    try {
      const response = await superAdminService.importUsers(file);
      const { berhasil, gagal, warnings } = response.report;

      if (berhasil > 0) {
        showToast.success(`Berhasil mengimpor ${berhasil} user baru.`, {
          duration: 5000,
        });
      }

      if (warnings && warnings.length > 0) {
        showToast.warning(
          `${warnings.length} peringatan. Cek konsol untuk detail.`,
          { duration: 4000 }
        );
        console.warn("Import Warnings:", warnings);
      }

      if (gagal > 0) {
        showToast.error(
          `${gagal} baris data gagal diimpor. Cek konsol untuk detail.`,
          { duration: 6000 }
        );
        console.error("Import Errors:", response.report.errors);
      }

      if (gagal === 0) {
        setShowImportModal(false);
      }

      setFilters((prev) => ({ ...prev, page: 1 }));
    } catch (err) {
      const errorData = handleApiError(err);
      showToast.error(errorData.message || "Gagal melakukan impor.", {
        duration: 5000,
      });
    }
  };

  const handleFilterChange = (key, value) => {
    if (key === "search") {
      debouncedSearch(value);
    } else {
      setFilters((prev) => ({ ...prev, page: 1, [key]: value }));
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setFilters((prev) => ({ ...prev, page: newPage }));
    }
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
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-text">
                Manajemen Users
              </h1>
              <p className="text-neutral-secondary mt-1">
                Total {pagination.totalDocs} user terdaftar
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              icon={<Upload className="w-5 h-5" />}
              onClick={() => setShowImportModal(true)}
            >
              Import Excel
            </Button>
            <Button
              variant="primary"
              icon={<Plus className="w-5 h-5" />}
              onClick={() => router.push("/super-admin/users/create")}
            >
              Tambah User
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Alert type="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-secondary" />
              <input
                type="text"
                placeholder="Cari nama, email, atau NIP/NISN..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main"
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <select
                className="px-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main bg-white"
                value={filters.role}
                onChange={(e) => handleFilterChange("role", e.target.value)}
              >
                <option value="">Semua Role</option>
                <option value="guru">Guru</option>
                <option value="siswa">Siswa</option>
              </select>
              <select
                className="px-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main bg-white"
                value={filters.isActive}
                onChange={(e) => handleFilterChange("isActive", e.target.value)}
              >
                <option value="all">Semua Status</option>
                <option value="true">Aktif Saja</option>
                <option value="false">Nonaktif Saja</option>
              </select>
              <select
                className="px-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main bg-white"
                value={filters.limit}
                onChange={(e) =>
                  handleFilterChange("limit", parseInt(e.target.value))
                }
              >
                <option value="10">10 per halaman</option>
                <option value="25">25 per halaman</option>
                <option value="50">50 per halaman</option>
              </select>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary-main animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-neutral-secondary mx-auto mb-4" />
              <p className="text-neutral-secondary text-lg">
                {filters.search || filters.role || filters.isActive !== "all"
                  ? "Tidak ada user yang sesuai dengan filter"
                  : "Belum ada data user"}
              </p>
            </div>
          ) : (
            <>
              <UserTable
                users={users}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onRestore={handleRestore}
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
      <ImportUserModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
      />

      <DeleteUserModal
        user={deleteModalUser}
        isOpen={!!deleteModalUser}
        onClose={() => setDeleteModalUser(null)}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
