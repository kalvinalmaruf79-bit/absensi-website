// src/app/(dashboard)/super-admin/kelas/edit/[id]/page.js
"use client";

import { useState, useEffect } from "react";
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
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (kelasId) {
      fetchKelasData();
      fetchGuruList();
    }
  }, [kelasId]);

  const fetchKelasData = async () => {
    try {
      const response = await superAdminService.getKelasById(kelasId);
      if (response.success) {
        setKelasData(response.data);
      }
    } catch (error) {
      showToast.error("Gagal memuat data kelas");
      console.error("Error fetching kelas:", error);
      router.push("/super-admin/kelas");
    }
  };

  const fetchGuruList = async () => {
    try {
      const response = await superAdminService.getAllUsers({
        role: "guru",
        isActive: true,
      });

      if (response.success) {
        setGuruList(response.data);
      } else if (Array.isArray(response)) {
        setGuruList(response);
      } else if (response.data && Array.isArray(response.data)) {
        setGuruList(response.data);
      }
    } catch (error) {
      showToast.error("Gagal memuat data guru");
      console.error("Error fetching guru:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setIsLoading(true);

      const submitData = {
        nama: formData.nama,
        tingkat: formData.tingkat,
        jurusan: formData.jurusan || "",
        tahunAjaran: formData.tahunAjaran,
      };

      // Only include waliKelas if selected
      if (formData.waliKelas) {
        submitData.waliKelas = formData.waliKelas;
      }

      console.log("Updating kelas data:", submitData);

      const response = await superAdminService.updateKelas(kelasId, submitData);

      if (response.success) {
        showToast.success("Kelas berhasil diupdate");
        router.push("/super-admin/kelas");
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
    router.push("/super-admin/kelas");
  };

  if (isLoadingData) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <Loader2 className="w-8 h-8 text-[#00a3d4] animate-spin" />
            <span className="text-gray-600">Memuat data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
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
                <h1 className="text-3xl font-bold text-gray-900">Edit Kelas</h1>
                <p className="text-gray-600 mt-1">
                  Update informasi kelas {kelasData?.nama}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
        <KelasForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          guruList={guruList}
          isLoading={isLoading}
          initialData={kelasData}
        />
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
                  Perubahan data kelas akan mempengaruhi jadwal dan informasi
                  terkait
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></span>
                <span>
                  Pastikan data yang diinput sudah benar sebelum menyimpan
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></span>
                <span>
                  Wali kelas dapat diubah atau dikosongkan jika diperlukan
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
