"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Save,
  RefreshCw,
  School,
  Calendar,
  BookOpen,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { superAdminService } from "@/services/super-admin.service";
import { showToast } from "@/lib/toast";
import Card from "@/components/ui/Card";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    namaSekolah: "",
    semesterAktif: "ganjil",
    tahunAjaranAktif: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialSettings, setInitialSettings] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const response = await superAdminService.getSettings();
      setSettings(response);
      setInitialSettings(response);
      setHasChanges(false);
    } catch (error) {
      console.error("Error fetching settings:", error);
      showToast.error(
        error.response?.data?.message ||
          "Gagal memuat pengaturan. Silakan coba lagi."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!settings.namaSekolah.trim()) {
      showToast.error("Nama sekolah wajib diisi");
      return;
    }

    if (!settings.tahunAjaranAktif.trim()) {
      showToast.error("Tahun ajaran aktif wajib diisi");
      return;
    }

    const tahunAjaranRegex = /^\d{4}\/\d{4}$/;
    if (!tahunAjaranRegex.test(settings.tahunAjaranAktif)) {
      showToast.error(
        "Format tahun ajaran tidak valid. Gunakan format YYYY/YYYY (contoh: 2024/2025)"
      );
      return;
    }

    setIsSaving(true);
    try {
      const response = await superAdminService.updateSettings(settings);
      showToast.success(response.message || "Pengaturan berhasil diperbarui");
      setInitialSettings(settings);
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving settings:", error);
      showToast.error(
        error.response?.data?.message ||
          "Gagal menyimpan pengaturan. Silakan coba lagi."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (initialSettings) {
      setSettings(initialSettings);
      setHasChanges(false);
      showToast.info("Perubahan dibatalkan");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary-main animate-spin mx-auto mb-4" />
            <p className="text-neutral-secondary">Memuat pengaturan...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00a3d4] to-[#005f8b] flex items-center justify-center shadow-lg">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-neutral-text">
                  Pengaturan Aplikasi
                </h1>
                <p className="text-neutral-secondary mt-1">
                  Kelola pengaturan global sistem
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchSettings}
                disabled={isLoading}
                className="px-4 py-2 border border-neutral-border text-neutral-text rounded-lg hover:bg-neutral-surface transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw
                  className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>
        </motion.div>

        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="bg-amber-50 border-amber-200">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <p className="text-amber-800 font-medium">
                  Ada perubahan yang belum disimpan
                </p>
              </div>
            </Card>
          </motion.div>
        )}

        <motion.div variants={itemVariants}>
          <Card>
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-text mb-3">
                  <School className="w-4 h-4 text-primary-main" />
                  Nama Sekolah
                </label>
                <input
                  type="text"
                  value={settings.namaSekolah}
                  onChange={(e) =>
                    handleInputChange("namaSekolah", e.target.value)
                  }
                  placeholder="Contoh: SMK Negeri 1 Jakarta"
                  className="w-full px-4 py-3 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main transition-all"
                />
                <p className="text-xs text-neutral-secondary mt-2">
                  Nama sekolah akan ditampilkan di seluruh aplikasi
                </p>
              </div>

              <div className="border-t border-neutral-border"></div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-text mb-3">
                  <Calendar className="w-4 h-4 text-primary-main" />
                  Tahun Ajaran Aktif
                </label>
                <input
                  type="text"
                  value={settings.tahunAjaranAktif}
                  onChange={(e) =>
                    handleInputChange("tahunAjaranAktif", e.target.value)
                  }
                  placeholder="Contoh: 2024/2025"
                  className="w-full px-4 py-3 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main transition-all"
                />
                <p className="text-xs text-neutral-secondary mt-2">
                  Format: YYYY/YYYY (contoh: 2024/2025)
                </p>
              </div>

              <div className="border-t border-neutral-border"></div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-text mb-3">
                  <BookOpen className="w-4 h-4 text-primary-main" />
                  Semester Aktif
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleInputChange("semesterAktif", "ganjil")}
                    className={`px-6 py-4 rounded-lg border-2 transition-all font-medium ${
                      settings.semesterAktif === "ganjil"
                        ? "border-primary-main bg-primary-surface text-primary-main shadow-sm"
                        : "border-neutral-border text-neutral-text hover:border-primary-main/50"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {settings.semesterAktif === "ganjil" && (
                        <CheckCircle className="w-5 h-5" />
                      )}
                      <span>Semester Ganjil</span>
                    </div>
                  </button>
                  <button
                    onClick={() => handleInputChange("semesterAktif", "genap")}
                    className={`px-6 py-4 rounded-lg border-2 transition-all font-medium ${
                      settings.semesterAktif === "genap"
                        ? "border-primary-main bg-primary-surface text-primary-main shadow-sm"
                        : "border-neutral-border text-neutral-text hover:border-primary-main/50"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {settings.semesterAktif === "genap" && (
                        <CheckCircle className="w-5 h-5" />
                      )}
                      <span>Semester Genap</span>
                    </div>
                  </button>
                </div>
                <p className="text-xs text-neutral-secondary mt-2">
                  Pilih semester yang sedang berjalan
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-border">
                <button
                  onClick={handleReset}
                  disabled={!hasChanges || isSaving}
                  className="px-6 py-2.5 border border-neutral-border text-neutral-text rounded-lg hover:bg-neutral-surface transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  disabled={!hasChanges || isSaving}
                  className="px-6 py-2.5 bg-gradient-to-br from-[#00a3d4] to-[#005f8b] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Simpan Perubahan
                    </>
                  )}
                </button>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6"
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                <School className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">
                  Nama Sekolah
                </h3>
                <p className="text-sm text-blue-700">
                  {settings.namaSekolah || "Belum diatur"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900 mb-1">
                  Tahun Ajaran
                </h3>
                <p className="text-sm text-green-700">
                  {settings.tahunAjaranAktif || "Belum diatur"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-purple-900 mb-1">Semester</h3>
                <p className="text-sm text-purple-700 capitalize">
                  {settings.semesterAktif}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
