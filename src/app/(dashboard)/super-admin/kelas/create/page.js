"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, GraduationCap, Info, AlertCircle } from "lucide-react";
import KelasForm from "@/components/super-admin/KelasForm";
import { superAdminService } from "@/services/super-admin.service";
import { showToast } from "@/lib/toast";

export default function CreateKelasPage() {
  const router = useRouter();
  const [guruList, setGuruList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGuru, setIsLoadingGuru] = useState(true);

  useEffect(() => {
    fetchGuruList();
  }, []);

  const fetchGuruList = async () => {
    try {
      setIsLoadingGuru(true);
      const response = await superAdminService.getAllUsers({
        role: "guru",
        isActive: true,
      });

      console.log("Guru List Response:", response);

      // Handle berbagai format response
      let guruData = [];
      if (response.success && Array.isArray(response.data)) {
        guruData = response.data;
      } else if (Array.isArray(response)) {
        guruData = response;
      } else if (response.data && Array.isArray(response.data)) {
        guruData = response.data;
      }

      setGuruList(guruData);

      if (guruData.length === 0) {
        showToast.info("Belum ada data guru yang aktif");
      }
    } catch (error) {
      console.error("Error fetching guru:", error);
      showToast.error(
        error.response?.data?.message || "Gagal memuat data guru"
      );
      setGuruList([]);
    } finally {
      setIsLoadingGuru(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setIsLoading(true);

      console.log("Form data received:", formData);

      // Validasi data sebelum submit
      if (
        !formData.nama ||
        !formData.tingkat ||
        !formData.jurusan ||
        !formData.tahunAjaran
      ) {
        showToast.error("Mohon lengkapi semua field yang wajib diisi");
        return;
      }

      // Prepare data untuk submit - pastikan format sesuai dengan backend
      const submitData = {
        nama: formData.nama.trim(),
        tingkat: formData.tingkat,
        jurusan: formData.jurusan,
        tahunAjaran: formData.tahunAjaran,
      };

      // Hanya tambahkan waliKelas jika dipilih dan valid
      // Backend mungkin tidak menerima string kosong untuk waliKelas
      if (formData.waliKelas && formData.waliKelas.trim() !== "") {
        submitData.waliKelas = formData.waliKelas.trim();
      }
      // Jika tidak ada waliKelas, jangan kirim property-nya sama sekali

      console.log("Data yang akan dikirim ke backend:", submitData);

      // Tambahkan try-catch khusus untuk API call
      let response;
      try {
        response = await superAdminService.createKelas(submitData);
        console.log("Response dari backend:", response);
      } catch (apiError) {
        console.error("API Error Detail:", {
          message: apiError.message,
          response: apiError.response?.data,
          status: apiError.response?.status,
          headers: apiError.response?.headers,
        });
        throw apiError;
      }

      // Handle response berdasarkan struktur yang diterima
      if (
        response.success ||
        response.data ||
        response.message?.includes("berhasil")
      ) {
        showToast.success(response.message || "Kelas berhasil ditambahkan");

        // Delay sedikit untuk memastikan toast muncul sebelum redirect
        setTimeout(() => {
          router.push("/super-admin/kelas");
        }, 500);
      } else {
        throw new Error(response.message || "Gagal menambahkan kelas");
      }
    } catch (error) {
      console.error("Error creating kelas:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
      });

      // Handle berbagai jenis error dengan lebih detail
      let errorMessage = "Gagal menambahkan kelas";

      if (error.response) {
        // Error dari server (4xx, 5xx)
        const status = error.response.status;
        const data = error.response.data;

        if (data?.message) {
          errorMessage = data.message;
        } else if (data?.error) {
          errorMessage = data.error;
        }

        // Handle specific status codes
        switch (status) {
          case 400:
            if (
              errorMessage.includes("duplicate") ||
              errorMessage.includes("sudah ada")
            ) {
              errorMessage =
                "Nama kelas sudah digunakan untuk tahun ajaran ini";
            } else if (
              errorMessage.includes("validation") ||
              errorMessage.includes("validasi")
            ) {
              errorMessage = "Data tidak valid. Periksa kembali input Anda";
            } else if (errorMessage.includes("waliKelas")) {
              errorMessage =
                "Wali kelas yang dipilih tidak valid atau sudah menjadi wali kelas lain";
            } else {
              errorMessage = `Permintaan tidak valid: ${errorMessage}`;
            }
            break;

          case 401:
            errorMessage = "Sesi Anda telah berakhir. Silakan login kembali";
            showToast.error(errorMessage);
            setTimeout(() => {
              router.push("/login");
            }, 1500);
            return;

          case 403:
            errorMessage =
              "Anda tidak memiliki akses untuk melakukan tindakan ini";
            break;

          case 404:
            errorMessage = "Endpoint tidak ditemukan. Hubungi administrator";
            break;

          case 409:
            errorMessage =
              "Data konflik. Kemungkinan kelas dengan nama yang sama sudah ada";
            break;

          case 500:
            errorMessage =
              "Terjadi kesalahan pada server. Silakan coba lagi atau hubungi administrator";
            // Log lebih detail untuk error 500
            console.error("Server Error 500 - Full Response:", {
              data: error.response.data,
              headers: error.response.headers,
              config: error.config,
            });
            break;

          default:
            errorMessage = `Error ${status}: ${errorMessage}`;
        }
      } else if (error.request) {
        // Request dibuat tapi tidak ada response
        errorMessage =
          "Gagal terhubung ke server. Periksa koneksi internet Anda";
      } else {
        // Error lain
        errorMessage =
          error.message || "Terjadi kesalahan yang tidak diketahui";
      }

      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/super-admin/kelas");
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Tambah Kelas Baru
              </h1>
              <p className="text-gray-600 mt-1">
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
        className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-200"
      >
        {isLoadingGuru ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse [animation-delay:0.4s]" />
            </div>
            <p className="text-sm text-gray-600">Memuat data guru...</p>
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
                <span>Nama kelas harus unik dalam satu tahun ajaran</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></span>
                <span>
                  Wali kelas bersifat opsional dan dapat ditentukan kemudian
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></span>
                <span>
                  Satu guru hanya dapat menjadi wali kelas untuk satu kelas
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></span>
                <span>Status kelas akan otomatis aktif saat dibuat</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Debug Info (Hanya tampil di development) */}
      {process.env.NODE_ENV === "development" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Debug Information:
              </h3>
              <div className="text-xs text-gray-600 space-y-1">
                <p>Total Guru: {guruList.length}</p>
                <p>Loading State: {isLoading ? "Yes" : "No"}</p>
                <p>Loading Guru: {isLoadingGuru ? "Yes" : "No"}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
