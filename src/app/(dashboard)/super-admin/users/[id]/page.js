// src/app/(dashboard)/super-admin/users/[id]/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { superAdminService } from "@/services/super-admin.service";
import { handleApiError } from "@/lib/api-helpers";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import UserForm from "@/components/super-admin/UserForm";
import { ArrowLeft, Trash2, Key, UserX, UserCheck } from "lucide-react";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");

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
      // Handle response structure yang berbeda
      const userData = response.data || response;
      setUser(userData);
    } catch (err) {
      const errorData = handleApiError(err);
      setError(errorData.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await superAdminService.updateUser(userId, data);
      setSuccess("User berhasil diperbarui");

      // Refresh user data
      await fetchUser();

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/super-admin/users");
      }, 2000);
    } catch (err) {
      const errorData = handleApiError(err);
      setError(errorData.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await superAdminService.resetPassword(userId, newPassword);
      setSuccess("Password berhasil direset");
      setShowResetPassword(false);
      setNewPassword("");

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorData = handleApiError(err);
      setError(errorData.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!user) return;

    setSaving(true);
    setError(null);

    try {
      await superAdminService.updateUser(userId, {
        isActive: !user.isActive,
      });
      setSuccess(
        `User berhasil ${user.isActive ? "dinonaktifkan" : "diaktifkan"}`
      );
      await fetchUser();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorData = handleApiError(err);
      setError(errorData.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;

    if (
      !confirm(
        `Yakin ingin menghapus user ${user.name}? Aksi ini tidak dapat dibatalkan.`
      )
    ) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await superAdminService.deleteUser(userId);
      router.push("/super-admin/users");
    } catch (err) {
      const errorData = handleApiError(err);
      setError(errorData.message);
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
        <Alert type="warning">User tidak ditemukan</Alert>
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
          <div>
            <h1 className="text-3xl font-bold text-neutral-text">
              Edit User: {user.name}
            </h1>
            <div className="flex items-center gap-3 mt-2">
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
            <Button
              variant="danger"
              icon={<Trash2 className="w-5 h-5" />}
              onClick={handleDelete}
              disabled={saving}
            >
              Hapus
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Alerts */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
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
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Alert type="success" onClose={() => setSuccess(null)}>
            {success}
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
            <h3 className="font-semibold text-yellow-900 mb-4">
              Reset Password User
            </h3>
            <div className="flex gap-3">
              <input
                type="password"
                placeholder="Password baru (min. 6 karakter)"
                className="flex-1 px-4 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
              >
                Batal
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Edit Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-3xl"
      >
        <Card>
          <UserForm
            mode="edit"
            initialData={user}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={saving}
          />
        </Card>
      </motion.div>
    </div>
  );
}
