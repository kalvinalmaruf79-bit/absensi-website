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
import { ArrowLeft, Key, UserX, UserCheck, Edit } from "lucide-react";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
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
      await superAdminService.updateUser(userId, data);
      showToast.success("User berhasil diperbarui");

      // Langsung redirect tanpa delay
      router.push("/super-admin/users");
    } catch (err) {
      const errorData = handleApiError(err);
      setError(errorData.message || "Gagal memperbarui user");
      showToast.error(errorData.message || "Gagal memperbarui user");
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      showToast.error("Password minimal 6 karakter");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await superAdminService.resetPassword(userId, newPassword);
      showToast.success("Password berhasil direset");
      setShowResetPassword(false);
      setNewPassword("");
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

    if (!confirm(`Yakin ingin ${action} user ${user.name}?`)) {
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

  if (loading) {
    return (
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
    );
  }

  if (!user) {
    return (
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
    );
  }

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
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              icon={<Key className="w-5 h-5" />}
              onClick={() => setShowResetPassword(!showResetPassword)}
              disabled={saving}
            >
              Reset Password
            </Button>
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

      {/* Reset Password Card */}
      {showResetPassword && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6"
        >
          <Card className="bg-yellow-50 border border-yellow-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <Key className="w-5 h-5 text-yellow-700" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 mb-2">
                  Reset Password User
                </h3>
                <p className="text-sm text-yellow-700 mb-4">
                  Masukkan password baru untuk user ini. Password akan langsung
                  aktif setelah direset.
                </p>
                <div className="flex gap-3">
                  <input
                    type="password"
                    placeholder="Password baru (min. 6 karakter)"
                    className="flex-1 px-4 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleResetPassword();
                      }
                    }}
                  />
                  <Button
                    variant="warning"
                    onClick={handleResetPassword}
                    disabled={saving}
                  >
                    Reset Password
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowResetPassword(false);
                      setNewPassword("");
                    }}
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
                  • Data yang dapat diubah: Nama, Email, dan Kelas (untuk siswa)
                </li>
                <li>• NIP/NISN tidak dapat diubah setelah user dibuat</li>
                <li>
                  • Gunakan tombol "Nonaktifkan" untuk menonaktifkan akses user
                  tanpa menghapus data
                </li>
                <li>
                  • Password hanya diubah jika diisi, kosongkan jika tidak ingin
                  mengubah
                </li>
                <li>• User yang dinonaktifkan tidak dapat login ke sistem</li>
              </ul>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
