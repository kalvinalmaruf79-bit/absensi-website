// src/app/(dashboard)/super-admin/kelas/create/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  GraduationCap,
  Info,
  AlertCircle,
  Loader2,
} from "lucide-react";
import KelasForm from "@/components/super-admin/KelasForm";
import { superAdminService } from "@/services/super-admin.service";
import { showToast } from "@/lib/toast";

export default function CreateKelasPage() {
  const router = useRouter();
  const [guruList, setGuruList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGuru, setIsLoadingGuru] = useState(true);

  useEffect(() => {
    const fetchGuruList = async () => {
      try {
        setIsLoadingGuru(true);
        // Request a large number of items to get all active teachers for the dropdown
        const response = await superAdminService.getAllUsers({
          role: "guru",
          isActive: true,
          limit: 1000,
        });

        // The paginated response contains data in the 'docs' property
        const guruData = response.docs || [];
        setGuruList(guruData);

        if (guruData.length === 0) {
          showToast.info(
            "Belum ada data guru yang aktif untuk dipilih sebagai wali kelas."
          );
        }
      } catch (error) {
        console.error("Error fetching guru:", error);
        showToast.error(
          error.response?.data?.message || "Gagal memuat daftar guru"
        );
        setGuruList([]);
      } finally {
        setIsLoadingGuru(false);
      }
    };

    fetchGuruList();
  }, []);

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    try {
      if (
        !formData.nama ||
        !formData.tingkat ||
        !formData.jurusan ||
        !formData.tahunAjaran
      ) {
        showToast.error("Mohon lengkapi semua field yang wajib diisi.");
        setIsLoading(false);
        return;
      }

      // Prepare data for submission
      const submitData = {
        nama: formData.nama.trim(),
        tingkat: formData.tingkat,
        jurusan: formData.jurusan.trim(),
        tahunAjaran: formData.tahunAjaran.trim(),
      };

      // Only include waliKelas if a valid one is selected
      if (formData.waliKelas && formData.waliKelas.trim() !== "") {
        submitData.waliKelas = formData.waliKelas.trim();
      }

      const response = await superAdminService.createKelas(submitData);

      if (response.success) {
        showToast.success(response.message || "Kelas berhasil ditambahkan");
        router.push("/super-admin/kelas");
      } else {
        // This case might not be hit if backend always throws errors for failures
        throw new Error(response.message || "Gagal menambahkan kelas");
      }
    } catch (error) {
      console.error("Error creating kelas:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Terjadi kesalahan saat membuat kelas.";
      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
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
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00a3d4] to-[#005f8b] flex items-center justify-center shadow-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-text">
                Tambah Kelas Baru
              </h1>
              <p className="text-neutral-secondary mt-1">
                Lengkapi form di bawah untuk menambahkan kelas baru
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow-soft p-6 md:p-8 mb-6 border border-neutral-border"
      >
        {isLoadingGuru ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary-main animate-spin mb-4" />
            <p className="text-sm text-neutral-secondary">
              Memuat data guru...
            </p>
          </div>
        ) : (
          <KelasForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            guruList={guruList}
            isLoading={isLoading}
          />
        )}
      </motion.div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-blue-50 border border-blue-200 rounded-lg p-6"
      >
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">
              Informasi Penting:
            </h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></span>
                <span>
                  Nama kelas harus unik dalam satu tahun ajaran yang sama.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></span>
                <span>
                  Wali kelas bersifat opsional dan dapat diubah nanti.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></span>
                <span>
                  Pastikan data guru sudah terisi sebelum menentukannya sebagai
                  wali kelas.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
