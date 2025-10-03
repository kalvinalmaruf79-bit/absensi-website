// src/app/(dashboard)/super-admin/jadwal/create/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Save,
  Loader2,
  Clock,
  BookOpen,
  GraduationCap,
  User,
  AlertCircle,
} from "lucide-react";
import { superAdminService } from "@/services/super-admin.service";
import { showToast } from "@/lib/toast";
import Card from "@/components/ui/Card";

const hariOptions = [
  { value: "senin", label: "Senin" },
  { value: "selasa", label: "Selasa" },
  { value: "rabu", label: "Rabu" },
  { value: "kamis", label: "Kamis" },
  { value: "jumat", label: "Jumat" },
  { value: "sabtu", label: "Sabtu" },
];

export default function CreateJadwalPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    kelas: "",
    mataPelajaran: "",
    guru: "",
    hari: "",
    jamMulai: "",
    jamSelesai: "",
    semester: "",
    tahunAjaran: "",
  });

  const [errors, setErrors] = useState({});

  const [kelasOptions, setKelasOptions] = useState([]);
  const [mataPelajaranOptions, setMataPelajaranOptions] = useState([]);
  const [guruOptions, setGuruOptions] = useState([]);
  const [filteredGuruOptions, setFilteredGuruOptions] = useState([]);

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    if (formData.mataPelajaran) {
      const filtered = guruOptions.filter((guru) =>
        guru.mataPelajaran?.some((mp) => mp._id === formData.mataPelajaran)
      );
      setFilteredGuruOptions(filtered);

      if (!filtered.find((g) => g._id === formData.guru)) {
        setFormData((prev) => ({ ...prev, guru: "" }));
      }
    } else {
      setFilteredGuruOptions([]);
      setFormData((prev) => ({ ...prev, guru: "" }));
    }
  }, [formData.mataPelajaran, guruOptions]);

  const fetchOptions = async () => {
    setIsLoading(true);
    try {
      const [kelasRes, mapelRes, guruRes, settingsRes] = await Promise.all([
        superAdminService.getAllKelas({ limit: 1000, isActive: true }),
        superAdminService.getAllMataPelajaran({ limit: 1000, isActive: true }),
        superAdminService.getAllUsers({
          role: "guru",
          isActive: true,
          limit: 1000,
        }),
        superAdminService.getSettings(),
      ]);

      if (kelasRes.success) {
        setKelasOptions(kelasRes.data || []);
      }

      if (mapelRes.docs) {
        setMataPelajaranOptions(mapelRes.docs || []);
      }

      if (guruRes.docs) {
        setGuruOptions(guruRes.docs || []);
      }

      if (settingsRes) {
        setFormData((prev) => ({
          ...prev,
          semester: settingsRes.semesterAktif || "",
          tahunAjaran: settingsRes.tahunAjaranAktif || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching options:", error);
      showToast.error("Gagal memuat data. Silakan refresh halaman.");
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.kelas) newErrors.kelas = "Kelas wajib dipilih";
    if (!formData.mataPelajaran)
      newErrors.mataPelajaran = "Mata pelajaran wajib dipilih";
    if (!formData.guru) newErrors.guru = "Guru wajib dipilih";
    if (!formData.hari) newErrors.hari = "Hari wajib dipilih";
    if (!formData.jamMulai) newErrors.jamMulai = "Jam mulai wajib diisi";
    if (!formData.jamSelesai) newErrors.jamSelesai = "Jam selesai wajib diisi";
    if (!formData.semester) newErrors.semester = "Semester wajib dipilih";
    if (!formData.tahunAjaran)
      newErrors.tahunAjaran = "Tahun ajaran wajib diisi";

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (formData.jamMulai && !timeRegex.test(formData.jamMulai)) {
      newErrors.jamMulai = "Format waktu tidak valid (HH:MM)";
    }
    if (formData.jamSelesai && !timeRegex.test(formData.jamSelesai)) {
      newErrors.jamSelesai = "Format waktu tidak valid (HH:MM)";
    }

    if (
      formData.jamMulai &&
      formData.jamSelesai &&
      timeRegex.test(formData.jamMulai) &&
      timeRegex.test(formData.jamSelesai)
    ) {
      const [startH, startM] = formData.jamMulai.split(":").map(Number);
      const [endH, endM] = formData.jamSelesai.split(":").map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      if (endMinutes <= startMinutes) {
        newErrors.jamSelesai = "Jam selesai harus lebih besar dari jam mulai";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast.error("Mohon lengkapi semua field dengan benar");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await superAdminService.createJadwal(formData);
      if (response.success) {
        showToast.success(response.message || "Jadwal berhasil dibuat");
        router.push("/super-admin/jadwal");
      } else {
        showToast.error(response.message || "Gagal membuat jadwal");
      }
    } catch (error) {
      console.error("Error creating jadwal:", error);
      const errorMessage =
        error.response?.data?.message || "Gagal membuat jadwal";
      showToast.error(errorMessage);

      if (error.response?.data?.conflictWith) {
        const field = error.response.data.conflictWith;
        setErrors((prev) => ({
          ...prev,
          [field]: errorMessage,
        }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-primary-main animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-neutral-secondary hover:text-neutral-text transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Kembali</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00a3d4] to-[#005f8b] flex items-center justify-center shadow-lg">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-text">
              Tambah Jadwal Baru
            </h1>
            <p className="text-neutral-secondary mt-1">
              Buat jadwal pelajaran baru untuk kelas
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-text mb-2">
                  <GraduationCap className="w-4 h-4 text-primary-main" />
                  Kelas <span className="text-danger">*</span>
                </label>
                <select
                  name="kelas"
                  value={formData.kelas}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main ${
                    errors.kelas
                      ? "border-danger focus:ring-danger"
                      : "border-neutral-border"
                  }`}
                >
                  <option value="">Pilih Kelas</option>
                  {kelasOptions.map((kelas) => (
                    <option key={kelas._id} value={kelas._id}>
                      {kelas.nama} - {kelas.tingkat} {kelas.jurusan} (
                      {kelas.tahunAjaran})
                    </option>
                  ))}
                </select>
                {errors.kelas && (
                  <p className="text-danger text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.kelas}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-text mb-2">
                  <BookOpen className="w-4 h-4 text-primary-main" />
                  Mata Pelajaran <span className="text-danger">*</span>
                </label>
                <select
                  name="mataPelajaran"
                  value={formData.mataPelajaran}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main ${
                    errors.mataPelajaran
                      ? "border-danger focus:ring-danger"
                      : "border-neutral-border"
                  }`}
                >
                  <option value="">Pilih Mata Pelajaran</option>
                  {mataPelajaranOptions.map((mapel) => (
                    <option key={mapel._id} value={mapel._id}>
                      {mapel.nama} ({mapel.kode})
                    </option>
                  ))}
                </select>
                {errors.mataPelajaran && (
                  <p className="text-danger text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.mataPelajaran}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-text mb-2">
                  <User className="w-4 h-4 text-primary-main" />
                  Guru <span className="text-danger">*</span>
                </label>
                <select
                  name="guru"
                  value={formData.guru}
                  onChange={handleChange}
                  disabled={!formData.mataPelajaran}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main disabled:bg-neutral-light/30 disabled:cursor-not-allowed ${
                    errors.guru
                      ? "border-danger focus:ring-danger"
                      : "border-neutral-border"
                  }`}
                >
                  <option value="">
                    {formData.mataPelajaran
                      ? "Pilih Guru"
                      : "Pilih Mata Pelajaran Terlebih Dahulu"}
                  </option>
                  {filteredGuruOptions.map((guru) => (
                    <option key={guru._id} value={guru._id}>
                      {guru.name} ({guru.identifier})
                    </option>
                  ))}
                </select>
                {errors.guru && (
                  <p className="text-danger text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.guru}
                  </p>
                )}
                {formData.mataPelajaran && filteredGuruOptions.length === 0 && (
                  <p className="text-warning text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Tidak ada guru yang mengampu mata pelajaran ini
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-text mb-2">
                  <Calendar className="w-4 h-4 text-primary-main" />
                  Hari <span className="text-danger">*</span>
                </label>
                <select
                  name="hari"
                  value={formData.hari}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main ${
                    errors.hari
                      ? "border-danger focus:ring-danger"
                      : "border-neutral-border"
                  }`}
                >
                  <option value="">Pilih Hari</option>
                  {hariOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.hari && (
                  <p className="text-danger text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.hari}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-text mb-2">
                  <Clock className="w-4 h-4 text-primary-main" />
                  Jam Mulai <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="jamMulai"
                  value={formData.jamMulai}
                  onChange={handleChange}
                  placeholder="07:00"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main font-mono ${
                    errors.jamMulai
                      ? "border-danger focus:ring-danger"
                      : "border-neutral-border"
                  }`}
                />
                {errors.jamMulai && (
                  <p className="text-danger text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.jamMulai}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-text mb-2">
                  <Clock className="w-4 h-4 text-primary-main" />
                  Jam Selesai <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="jamSelesai"
                  value={formData.jamSelesai}
                  onChange={handleChange}
                  placeholder="08:30"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main font-mono ${
                    errors.jamSelesai
                      ? "border-danger focus:ring-danger"
                      : "border-neutral-border"
                  }`}
                />
                {errors.jamSelesai && (
                  <p className="text-danger text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.jamSelesai}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-text mb-2">
                  <Calendar className="w-4 h-4 text-primary-main" />
                  Semester <span className="text-danger">*</span>
                </label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main ${
                    errors.semester
                      ? "border-danger focus:ring-danger"
                      : "border-neutral-border"
                  }`}
                >
                  <option value="">Pilih Semester</option>
                  <option value="ganjil">Ganjil</option>
                  <option value="genap">Genap</option>
                </select>
                {errors.semester && (
                  <p className="text-danger text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.semester}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-text mb-2">
                  <Calendar className="w-4 h-4 text-primary-main" />
                  Tahun Ajaran <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="tahunAjaran"
                  value={formData.tahunAjaran}
                  onChange={handleChange}
                  placeholder="2024/2025"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main ${
                    errors.tahunAjaran
                      ? "border-danger focus:ring-danger"
                      : "border-neutral-border"
                  }`}
                />
                {errors.tahunAjaran && (
                  <p className="text-danger text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.tahunAjaran}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-info/10 border border-info/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-info mt-0.5" />
                <div className="text-sm text-neutral-text">
                  <p className="font-semibold mb-1">Catatan Penting:</p>
                  <ul className="list-disc list-inside space-y-1 text-neutral-secondary">
                    <li>
                      Jadwal berurutan (contoh: 12:35-13:10, 13:10-14:00)
                      diperbolehkan
                    </li>
                    <li>
                      Sistem akan mencegah bentrokan jadwal untuk kelas dan guru
                      yang sama
                    </li>
                    <li>
                      Guru hanya bisa dipilih jika mengampu mata pelajaran yang
                      dipilih
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-border">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="px-6 py-2 border border-neutral-border text-neutral-text rounded-lg hover:bg-neutral-surface transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-gradient-to-br from-[#00a3d4] to-[#005f8b] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 font-semibold shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Simpan Jadwal
                  </>
                )}
              </button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
