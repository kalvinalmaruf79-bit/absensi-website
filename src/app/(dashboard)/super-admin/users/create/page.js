"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import UserForm from "@/components/super-admin/UserForm";
import { superAdminService } from "@/services/super-admin.service";
import { handleApiError } from "@/lib/api-helpers";
import { showToast } from "@/lib/toast"; // Import showToast
import { ArrowLeft } from "lucide-react";

export default function CreateUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  // Hapus state 'error' dan 'success' yang sebelumnya untuk Alert
  // const [error, setError] = useState(null);
  // const [success, setSuccess] = useState(false);

  const handleSubmit = async (userData, role) => {
    setLoading(true);

    const promise =
      role === "guru"
        ? superAdminService.createGuru(userData)
        : superAdminService.createSiswa(userData);

    // Gunakan showToast.promise untuk menangani semua state
    showToast
      .promise(promise, {
        pending: `Membuat user ${role} baru...`,
        success: `User ${role} berhasil dibuat! Mengalihkan...`,
        error: ({ data }) => {
          // 'data' berisi objek error dari promise yang gagal
          const errorData = handleApiError(data);
          return errorData.message || "Gagal membuat user";
        },
      })
      .then(() => {
        // Jika berhasil, tunggu sebentar agar user bisa membaca toast
        setTimeout(() => {
          router.push("/super-admin/users");
        }, 1500);
      })
      .catch(() => {
        // Jika gagal, toast sudah ditampilkan. Cukup re-enable tombol.
        setLoading(false);
      });
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
            icon={<ArrowLeft className="w-5 h-5" />}
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
                <li>• Password akan di-generate otomatis sesuai NIP/NISN</li>
                <li>• Untuk siswa, pilih kelas yang sesuai</li>
              </ul>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
