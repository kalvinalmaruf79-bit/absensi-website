// src/app/(dashboard)/super-admin/users/create/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { superAdminService } from "@/services/super-admin.service";
import { handleApiError } from "@/lib/api-helpers";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Alert from "@/components/ui/Alert";
import UserForm from "@/components/super-admin/UserForm";
import { ArrowLeft, Info } from "lucide-react";

export default function CreateUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (data, role) => {
    setLoading(true);
    setError(null);

    try {
      // Call appropriate service based on role
      if (role === "guru") {
        await superAdminService.createGuru(data);
      } else if (role === "siswa") {
        await superAdminService.createSiswa(data);
      }

      // Redirect to users page on success
      router.push("/super-admin/users");
    } catch (err) {
      const errorData = handleApiError(err);
      setError(errorData.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

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
        <h1 className="text-3xl font-bold text-neutral-text">
          Tambah User Baru
        </h1>
        <p className="text-neutral-secondary mt-2">
          Buat akun baru untuk guru atau siswa
        </p>
      </motion.div>

      {/* Error Alert */}
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

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-3xl"
      >
        <Card>
          <UserForm
            mode="create"
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
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
              <Info className="w-6 h-6 text-blue-600" />
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
                <li>• Pastikan email dan NIP/NISN belum terdaftar</li>
              </ul>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
