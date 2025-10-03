// src/app/(dashboard)/super-admin/users/[id]/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { superAdminService } from "@/services/super-admin.service";
import { handleApiError } from "@/lib/api-helpers";
import { showToast } from "@/lib/toast";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Alert from "@/components/ui/Alert";
import UserForm from "@/components/super-admin/UserForm";
import {
  ArrowLeft,
  Key,
  UserX,
  UserCheck,
  Edit,
  AlertTriangle,
} from "lucide-react";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const fetchUser = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await superAdminService.getUserById(userId);
      const userData = response.data || response;
      setUser(userData);
    } catch (err) {
      const errorData = handleApiError(err);
      setError(errorData.message || "Gagal memuat data user");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    setSaving(true);
    setError(null);

    try {
      // Pastikan tidak mengirim field yang tidak seharusnya diubah (seperti password)
      const dataToUpdate = {
        name: data.name,
        email: data.email,
      };
      if (data.kelas) {
        dataToUpdate.kelas = data.kelas;
      }

      await superAdminService.updateUser(userId, dataToUpdate);
      showToast.success("User berhasil diperbarui");
      router.push("/super-admin/users");
    } catch (err) {
      const errorData = handleApiError(err);
      setError(errorData.message || "Gagal memperbarui user");
      showToast.error(errorData.message || "Gagal memperbarui user");
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    setSaving(true);
    setError(null);

    try {
      // Memanggil fungsi service yang sudah diperbaiki (tanpa argumen password)
      await superAdminService.resetPassword(userId);
      showToast.success(
        `Password berhasil direset ke ${
          user.role === "guru" ? "NIP" : "NISN"
        } (${user.identifier})`
      );
      setShowResetConfirm(false);
      await fetchUser(); // Refresh data user untuk mendapatkan status isPasswordDefault jika ada
    } catch (err) {
      const errorData = handleApiError(err);
      setError(errorData.message || "Gagal mereset password");
      showToast.error(errorData.message || "Gagal mereset password");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!user) return;

    const action = user.isActive ? "nonaktifkan" : "aktifkan";

    // Menggunakan window.confirm untuk konfirmasi sederhana
    if (!window.confirm(`Yakin ingin ${action} user ${user.name}?`)) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await superAdminService.updateUser(userId, {
        isActive: !user.isActive,
      });
      showToast.success(`User berhasil di${action}`);
      await fetchUser();
    } catch (err) {
      const errorData = handleApiError(err);
      setError(errorData.message || "Gagal mengubah status user");
      showToast.error(errorData.message || "Gagal mengubah status user");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/super-admin/users");
  };

  // (Sisa kode JSX tetap sama persis seperti yang Anda berikan, tidak ada perubahan visual)
  // ...
  // ...
  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowLeft className="w-5 h-5" />}
          onClick={handleCancel}
          className="mb-4"
        >
          Kembali
        </Button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00a3d4] to-[#005f8b] flex items-center justify-center shadow-lg">
              <Edit className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-text">
                Edit User
              </h1>
              {user && (
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-neutral-secondary">{user.name}</span>
                  <span className="text-neutral-border">•</span>
                  <Badge variant={user.role === "guru" ? "info" : "primary"}>
                    {user.role === "guru" ? "Guru" : "Siswa"}
                  </Badge>
                  <Badge variant={user.isActive ? "success" : "danger"}>
                    {user.isActive ? "Aktif" : "Nonaktif"}
                  </Badge>
                  <span className="text-neutral-secondary text-sm">
                    {user.identifier}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              icon={<Key className="w-5 h-5" />}
              onClick={() => setShowResetConfirm(true)}
              disabled={saving}
            >
              Reset Password
            </Button>
            {user && (
              <Button
                variant={user.isActive ? "warning" : "success"}
                icon={
                  user.isActive ? (
                    <UserX className="w-5 h-5" />
                  ) : (
                    <UserCheck className="w-5 h-5" />
                  )
                }
                onClick={handleToggleStatus}
                disabled={saving}
              >
                {user.isActive ? "Nonaktifkan" : "Aktifkan"}
              </Button>
            )}
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

      {/* Loading Skeleton */}
      {loading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-2 h-2 rounded-full bg-[#00a3d4] animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-[#00a3d4] animate-pulse [animation-delay:0.2s]" />
            <div className="w-2 h-2 rounded-full bg-[#00a3d4] animate-pulse [animation-delay:0.4s]" />
          </motion.div>
        </div>
      )}

      {/* Main Content when not loading */}
      {!loading && user && (
        <>
          {/* Reset Password Confirmation Modal */}
          {showResetConfirm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Card className="bg-orange-50 border-2 border-orange-400">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-orange-900 text-lg mb-2">
                      Konfirmasi Reset Password
                    </h3>
                    <p className="text-sm text-orange-800 mb-4">
                      Password user{" "}
                      <span className="font-semibold">{user.name}</span> akan
                      direset ke{" "}
                      <span className="font-semibold">
                        {user.role === "guru" ? "NIP" : "NISN"}
                      </span>
                      :
                    </p>
                    <div className="bg-orange-100 border border-orange-300 rounded-lg p-3 mb-4">
                      <p className="text-center font-mono font-bold text-orange-900 text-lg">
                        {user.identifier}
                      </p>
                    </div>
                    <p className="text-sm text-orange-700 mb-4">
                      User akan diminta untuk mengganti password saat login
                      pertama kali.
                    </p>
                    <div className="flex gap-3">
                      <Button
                        variant="warning"
                        onClick={handleResetPassword}
                        disabled={saving}
                      >
                        {saving ? "Mereset..." : "Ya, Reset Password"}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => setShowResetConfirm(false)}
                        disabled={saving}
                      >
                        Batal
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Edit Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="max-w-3xl">
              <UserForm
                mode="edit"
                initialData={user}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                loading={saving}
              />
            </Card>
          </motion.div>

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-3xl mt-6"
          >
            <Card className="bg-blue-50 border border-blue-200">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Informasi Penting
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>
                      • Data yang dapat diubah: Nama, Email, dan Kelas (untuk
                      siswa)
                    </li>
                    <li>• NIP/NISN tidak dapat diubah setelah user dibuat</li>
                    <li>
                      • Gunakan tombol "Nonaktifkan" untuk menonaktifkan akses
                      user tanpa menghapus data
                    </li>
                    <li>
                      • Reset password akan mengubah password ke NIP/NISN user
                      secara otomatis
                    </li>
                    <li>
                      • User yang dinonaktifkan tidak dapat login ke sistem
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </motion.div>
        </>
      )}

      {!loading && !user && (
        <div className="container mx-auto px-6 py-8">
          <Card className="bg-yellow-50 border-2 border-yellow-400 p-6">
            <p className="text-yellow-900 text-center font-semibold">
              User tidak ditemukan
            </p>
          </Card>
          <Button onClick={handleCancel} className="mt-4">
            Kembali
          </Button>
        </div>
      )}
    </div>
  );
}
