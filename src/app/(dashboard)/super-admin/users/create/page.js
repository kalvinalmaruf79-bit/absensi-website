// src/app/(dashboard)/super-admin/users/create/page.js
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Alert from "@/components/ui/Alert";
import UserForm from "@/components/super-admin/UserForm";
import { superAdminService } from "@/services/super-admin.service";
import { handleApiError } from "@/lib/api-helpers";

export default function CreateUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (userData, role) => {
    setLoading(true);
    setError(null);

    try {
      // Call the appropriate API based on role
      if (role === "guru") {
        await superAdminService.createGuru(userData);
      } else if (role === "siswa") {
        await superAdminService.createSiswa(userData);
      }

      setSuccess(true);

      // Redirect to users page after 2 seconds
      setTimeout(() => {
        router.push("/super-admin/users");
      }, 2000);
    } catch (err) {
      console.error("Error creating user:", err);
      const errorData = handleApiError(err);
      setError(errorData.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/super-admin/users");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto px-6 py-8"
    >
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            }
          >
            Kembali
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-neutral-text">
          Tambah User Baru
        </h1>
        <p className="text-neutral-secondary mt-2">
          Buat akun baru untuk guru atau siswa
        </p>
      </motion.div>

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
          <Alert type="success">
            User berhasil dibuat! Mengalihkan ke halaman users...
          </Alert>
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        <Card className="max-w-3xl">
          <UserForm
            mode="create"
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="max-w-3xl mt-6">
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
                Panduan Membuat User
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Pilih role terlebih dahulu (Guru atau Siswa)</li>
                <li>• Isi semua informasi yang diperlukan</li>
                <li>• Password akan di-generate otomatis jika tidak diisi</li>
                <li>• Untuk siswa, pilih kelas yang sesuai</li>
              </ul>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
