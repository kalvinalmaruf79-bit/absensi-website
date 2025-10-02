// src/app/(dashboard)/super-admin/kelas/edit/[id]/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, GraduationCap, Info, Loader2 } from "lucide-react";
import KelasForm from "@/components/super-admin/KelasForm";
import { superAdminService } from "@/services/super-admin.service";
import { showToast } from "@/lib/toast";

export default function EditKelasPage() {
  const router = useRouter();
  const params = useParams();
  const kelasId = params.id;

  const [kelasData, setKelasData] = useState(null);
  const [guruList, setGuruList] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Untuk submit form
  const [isLoadingData, setIsLoadingData] = useState(true); // Untuk memuat data awal

  const fetchInitialData = useCallback(async () => {
    if (!kelasId) return;

    setIsLoadingData(true);
    try {
      // Ambil data kelas dan data guru secara paralel
      const [kelasResponse, guruResponse] = await Promise.all([
        superAdminService.getKelasById(kelasId),
        superAdminService.getAllUsers({
          role: "guru",
          isActive: true,
          limit: 1000, // Ambil semua guru aktif untuk dropdown
        }),
      ]);

      // Proses data kelas
      if (kelasResponse.success) {
        setKelasData(kelasResponse.data);
      } else {
        throw new Error("Gagal memuat data kelas.");
      }

      // Proses data guru dari response paginated
      const guruData = guruResponse.docs || [];
      setGuruList(guruData);
    } catch (error) {
      showToast.error(error.message || "Gagal memuat data untuk edit.");
      console.error("Error fetching initial data:", error);
      // Kembali ke halaman sebelumnya jika gagal memuat data penting
      router.push("/super-admin/kelas");
    } finally {
      setIsLoadingData(false);
    }
  }, [kelasId, router]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    try {
      const submitData = {
        nama: formData.nama,
        tingkat: formData.tingkat,
        jurusan: formData.jurusan || "",
        tahunAjaran: formData.tahunAjaran,
        // Kirim null jika wali kelas dikosongkan
        waliKelas: formData.waliKelas || null,
      };

      const response = await superAdminService.updateKelas(kelasId, submitData);

      if (response.success) {
        showToast.success(response.message || "Kelas berhasil diupdate");
        router.push("/super-admin/kelas");
      } else {
        throw new Error(response.message || "Gagal mengupdate kelas");
      }
    } catch (error) {
      console.error("Error updating kelas:", error);
      showToast.error(
        error.response?.data?.message || "Gagal mengupdate kelas"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoadingData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#00a3d4] animate-spin" />
          <p className="text-neutral-secondary">Memuat data kelas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Kembali"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00a3d4] to-[#005f8b] flex items-center justify-center shadow-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-text">
                Edit Kelas
              </h1>
              <p className="text-neutral-secondary mt-1">
                Update informasi untuk kelas {kelasData?.nama}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg shadow-soft p-6 md:p-8 mb-6 border border-neutral-border">
        {kelasData && (
          <KelasForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            guruList={guruList}
            isLoading={isLoading}
            initialData={kelasData}
          />
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
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
                  Perubahan data akan langsung tersimpan dan mempengaruhi data
                  lain yang terkait.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></span>
                <span>
                  Pastikan data yang diinput sudah benar sebelum menyimpan.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></span>
                <span>
                  Wali kelas dapat diubah atau dikosongkan jika diperlukan.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
