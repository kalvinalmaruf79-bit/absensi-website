// src/app/(dashboard)/super-admin/users/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { superAdminService } from "@/services/super-admin.service";
import { handleApiError } from "@/lib/api-helpers";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Alert from "@/components/ui/Alert";
import UserTable from "@/components/super-admin/UserTable";
import ImportUserModal from "@/components/super-admin/ImportUserModal";
import { Users, Upload, Plus, Search } from "lucide-react";

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Filters - pisahkan menjadi state individual
  const [role, setRole] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Pagination
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
  });

  // Modal states
  const [showImportModal, setShowImportModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Gunakan useCallback untuk fetchUsers
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const filters = { role, search, page, limit };
      console.log("Fetching users with filters:", filters);
      const response = await superAdminService.getAllUsers(filters);

      console.log("Full API Response:", response);

      // Handle different response structures
      let userData = [];
      let paginationData = {
        total: 0,
        page: page,
        pages: 1,
      };

      // Check if response has data property
      if (response.data) {
        if (Array.isArray(response.data)) {
          userData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          userData = response.data.data;
        }

        // Check for pagination info
        if (response.data.pagination) {
          paginationData = response.data.pagination;
        } else if (response.pagination) {
          paginationData = response.pagination;
        }
      } else if (Array.isArray(response)) {
        // Direct array response
        userData = response;
        paginationData.total = response.length;
      }

      console.log("Processed users:", userData);
      console.log("Pagination:", paginationData);

      setUsers(userData);
      setPagination(paginationData);
    } catch (err) {
      console.error("Error fetching users:", err);
      const errorData = handleApiError(err);
      setError(errorData.message || "Gagal memuat data users");
    } finally {
      setLoading(false);
    }
  }, [role, search, page, limit]);

  // useEffect dengan dependency yang benar
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEdit = (user) => {
    router.push(`/super-admin/users/${user._id}`);
  };

  const handleDelete = async (user) => {
    if (!deleteConfirm) {
      setDeleteConfirm(user);
      return;
    }

    try {
      await superAdminService.deleteUser(user._id);
      setSuccess(`User ${user.name} berhasil dihapus`);
      setDeleteConfirm(null);
      fetchUsers();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorData = handleApiError(err);
      setError(errorData.message || "Gagal menghapus user");
    }
  };

  const handleImport = async (file) => {
    try {
      const response = await superAdminService.importUsers(file);
      setSuccess(`Berhasil import ${response.data?.imported || 0} users`);
      setShowImportModal(false);
      fetchUsers();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorData = handleApiError(err);
      throw new Error(errorData.message || "Gagal import users");
    }
  };

  const handleFilterChange = (key, value) => {
    if (key === "role") setRole(value);
    else if (key === "search") setSearch(value);
    else if (key === "limit") setLimit(value);
    // Reset page ke 1 saat filter berubah
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Debounced search
  const handleSearchChange = (value) => {
    handleFilterChange("search", value);
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
                Kelola data guru dan siswa
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

      {/* Alerts */}
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

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Alert type="success" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        </motion.div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Alert type="warning">
            <div className="flex items-center justify-between">
              <span>
                Yakin ingin menghapus user <strong>{deleteConfirm.name}</strong>
                ?
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Batal
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(deleteConfirm)}
                >
                  Hapus
                </Button>
              </div>
            </div>
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
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <select
                className="px-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main bg-white"
                value={role}
                onChange={(e) => handleFilterChange("role", e.target.value)}
              >
                <option value="">Semua Role</option>
                <option value="guru">Guru</option>
                <option value="siswa">Siswa</option>
                <option value="super_admin">Super Admin</option>
              </select>
              <select
                className="px-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main bg-white"
                value={limit}
                onChange={(e) =>
                  handleFilterChange("limit", parseInt(e.target.value))
                }
              >
                <option value="10">10 per halaman</option>
                <option value="25">25 per halaman</option>
                <option value="50">50 per halaman</option>
                <option value="100">100 per halaman</option>
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
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#00a3d4] animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-[#00a3d4] animate-pulse [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-[#00a3d4] animate-pulse [animation-delay:0.4s]" />
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-neutral-secondary mx-auto mb-4" />
              <p className="text-neutral-secondary text-lg">
                {search || role
                  ? "Tidak ada data user yang sesuai filter"
                  : "Tidak ada data user"}
              </p>
              {!search && !role && (
                <Button
                  variant="primary"
                  className="mt-4"
                  onClick={() => router.push("/super-admin/users/create")}
                >
                  Tambah User Pertama
                </Button>
              )}
            </div>
          ) : (
            <>
              <UserTable
                users={users}
                onEdit={handleEdit}
                onDelete={handleDelete}
                loading={loading}
              />

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t">
                  <p className="text-sm text-neutral-secondary">
                    Menampilkan {(pagination.page - 1) * limit + 1} -{" "}
                    {Math.min(pagination.page * limit, pagination.total)} dari{" "}
                    {pagination.total} users
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={pagination.page === 1}
                      onClick={() => handlePageChange(pagination.page - 1)}
                    >
                      Sebelumnya
                    </Button>
                    {[...Array(Math.min(pagination.pages, 5))].map((_, i) => {
                      let pageNum;
                      if (pagination.pages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.pages - 2) {
                        pageNum = pagination.pages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          size="sm"
                          variant={
                            pagination.page === pageNum
                              ? "primary"
                              : "secondary"
                          }
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={pagination.page === pagination.pages}
                      onClick={() => handlePageChange(pagination.page + 1)}
                    >
                      Selanjutnya
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </motion.div>

      {/* Import Modal */}
      <ImportUserModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
      />
    </div>
  );
}
