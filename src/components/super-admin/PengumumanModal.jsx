// src/components/super-admin/PengumumanModal.jsx
"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Save, Loader2, AlertCircle } from "lucide-react";
import { pengumumanService } from "@/services/pengumuman.service";
import { superAdminService } from "@/services/super-admin.service";

export default function PengumumanModal({ pengumuman, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    judul: "",
    isi: "",
    targetRole: "semua",
    targetKelas: [],
    isPublished: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [kelasList, setKelasList] = useState([]);
  const [loadingKelas, setLoadingKelas] = useState(false);

  // Set form data immediately when modal opens
  useEffect(() => {
    if (pengumuman) {
      setFormData({
        judul: pengumuman.judul || "",
        isi: pengumuman.isi || "",
        targetRole: pengumuman.targetRole || "semua",
        targetKelas: pengumuman.targetKelas?.map((k) => k._id || k) || [],
        isPublished: pengumuman.isPublished || false,
      });

      // Fetch kelas list di background jika target siswa
      if (pengumuman.targetRole === "siswa") {
        fetchKelasList();
      }
    }
  }, [pengumuman]);

  // Handle perubahan targetRole (untuk mode create)
  useEffect(() => {
    if (!pengumuman && formData.targetRole === "siswa") {
      fetchKelasList();
    } else if (!pengumuman && formData.targetRole !== "siswa") {
      setFormData((prev) => ({ ...prev, targetKelas: [] }));
    }
  }, [formData.targetRole, pengumuman]);

  const fetchKelasList = async () => {
    try {
      setLoadingKelas(true);
      const response = await superAdminService.getAllKelas({
        isActive: true,
        limit: 100,
      });
      setKelasList(response.data || []);
    } catch (err) {
      console.error("Error fetching kelas:", err);
      setError("Gagal memuat daftar kelas. Silakan coba lagi.");
    } finally {
      setLoadingKelas(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
  };

  const handleKelasToggle = (kelasId) => {
    setFormData((prev) => ({
      ...prev,
      targetKelas: prev.targetKelas.includes(kelasId)
        ? prev.targetKelas.filter((id) => id !== kelasId)
        : [...prev.targetKelas, kelasId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.judul.trim() || !formData.isi.trim()) {
      setError("Judul dan isi pengumuman wajib diisi");
      return;
    }

    if (formData.targetRole === "siswa" && formData.targetKelas.length === 0) {
      setError("Pilih minimal satu kelas untuk target siswa");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        judul: formData.judul.trim(),
        isi: formData.isi.trim(),
        targetRole: formData.targetRole,
        targetKelas:
          formData.targetRole === "siswa" ? formData.targetKelas : [],
        isPublished: formData.isPublished,
      };

      if (pengumuman) {
        await pengumumanService.updatePengumuman(pengumuman._id, payload);
      } else {
        await pengumumanService.createPengumuman(payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error saving pengumuman:", err);
      setError(
        err.response?.data?.message ||
          "Terjadi kesalahan saat menyimpan pengumuman"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {pengumuman ? "Edit Pengumuman" : "Buat Pengumuman Baru"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
              >
                <AlertCircle size={20} />
                <p className="text-sm">{error}</p>
              </motion.div>
            )}

            {/* Judul */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Judul Pengumuman <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="judul"
                value={formData.judul}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a3d4]/20 focus:border-[#00a3d4] outline-none transition-all"
                placeholder="Masukkan judul pengumuman"
                required
              />
            </div>

            {/* Isi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Isi Pengumuman <span className="text-red-500">*</span>
              </label>
              <textarea
                name="isi"
                value={formData.isi}
                onChange={handleChange}
                rows={6}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a3d4]/20 focus:border-[#00a3d4] outline-none transition-all resize-none"
                placeholder="Masukkan isi pengumuman"
                required
              />
            </div>

            {/* Target Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Penerima
              </label>
              <select
                name="targetRole"
                value={formData.targetRole}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a3d4]/20 focus:border-[#00a3d4] outline-none transition-all"
                disabled={!!pengumuman}
              >
                <option value="semua">Semua (Guru & Siswa)</option>
                <option value="guru">Guru Saja</option>
                <option value="siswa">Siswa Saja</option>
              </select>
              {pengumuman && (
                <p className="text-xs text-gray-500 mt-1">
                  Target penerima tidak dapat diubah saat mengedit
                </p>
              )}
            </div>

            {/* Target Kelas (if siswa) */}
            {formData.targetRole === "siswa" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Kelas <span className="text-red-500">*</span>
                </label>
                {loadingKelas ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-[#00a3d4] animate-spin" />
                  </div>
                ) : (
                  <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                    {kelasList.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        Tidak ada kelas tersedia
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {kelasList.map((kelas) => (
                          <label
                            key={kelas._id}
                            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={formData.targetKelas.includes(kelas._id)}
                              onChange={() => handleKelasToggle(kelas._id)}
                              className="w-4 h-4 text-[#00a3d4] border-gray-300 rounded focus:ring-[#00a3d4]"
                            />
                            <span className="text-sm text-gray-700">
                              {kelas.nama}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {formData.targetKelas.length > 0 && (
                  <p className="text-xs text-gray-600 mt-2">
                    {formData.targetKelas.length} kelas dipilih
                  </p>
                )}
              </div>
            )}

            {/* Publish Status */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleChange}
                  className="w-5 h-5 text-[#00a3d4] border-gray-300 rounded focus:ring-[#00a3d4]"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Publikasikan Sekarang
                  </span>
                  <p className="text-xs text-gray-500">
                    Pengumuman akan langsung terlihat oleh target penerima
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#00a3d4] to-[#00b2e2] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={20} />
                  {pengumuman ? "Update" : "Simpan"}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
