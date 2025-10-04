// src/app/(dashboard)/super-admin/academic-cycle/page.js
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  FileText,
  Users,
  ArrowRight,
  Info,
  AlertTriangle,
  Database,
} from "lucide-react";
import Card from "@/components/ui/Card";
import { superAdminService } from "@/services/super-admin.service";
import { showToast } from "@/lib/toast";

export default function AcademicCyclePage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Settings & Validation
  const [settings, setSettings] = useState(null);
  const [canProcessPromotion, setCanProcessPromotion] = useState(false);

  // Data
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [tahunAjaran, setTahunAjaran] = useState("");
  const [semester, setSemester] = useState("");
  const [siswaData, setSiswaData] = useState([]);
  const [targetKelasList, setTargetKelasList] = useState([]);
  const [dataAvailability, setDataAvailability] = useState(null);

  // Fetch settings dan validasi semester
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await superAdminService.getSettings();
        setSettings(response);

        setTahunAjaran(response.tahunAjaranAktif);
        setSemester(response.semesterAktif);

        if (response.semesterAktif !== "genap") {
          setCanProcessPromotion(false);
          showToast.warning(
            "Kenaikan kelas hanya dapat dilakukan di akhir semester genap"
          );
        } else {
          setCanProcessPromotion(true);
        }
      } catch (error) {
        showToast.error("Gagal memuat pengaturan sistem");
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (canProcessPromotion) {
      fetchKelas();
    }
  }, [canProcessPromotion]);

  const fetchKelas = async () => {
    try {
      const response = await superAdminService.getAllKelas({
        isActive: "true",
        tahunAjaran: tahunAjaran,
        limit: 1000,
      });
      if (response.success) {
        setKelasList(response.data || []);
      }
    } catch (error) {
      showToast.error("Gagal memuat data kelas");
    }
  };

  const getNextTingkat = (currentTingkat) => {
    if (currentTingkat === "X") return "XI";
    if (currentTingkat === "XI") return "XII";
    return "";
  };

  const getNextTahunAjaran = (current) => {
    const [start, end] = current.split("/").map(Number);
    return `${start + 1}/${end + 1}`;
  };

  const handleGetRecommendations = async () => {
    if (!selectedKelas) {
      showToast.error("Pilih kelas terlebih dahulu");
      return;
    }

    setIsLoading(true);
    try {
      const response = await superAdminService.getPromotionRecommendation({
        kelasId: selectedKelas._id,
        tahunAjaran,
      });

      if (response.success) {
        setRecommendations(response.data);
        setDataAvailability(response.data.dataAvailability);

        const initialSiswaData = response.data.siswa.map((s) => ({
          siswaId: s.siswaId,
          nama: s.nama,
          nis: s.nis,
          status: s.systemRecommendation,
          toKelasId: s.recommendedKelasId || "",
          rekap: s.rekap,
          reasons: s.reasons,
          warnings: s.warnings || [],
          needsManualReview: s.needsManualReview || false,
        }));
        setSiswaData(initialSiswaData);

        const nextTingkat = getNextTingkat(selectedKelas.tingkat);
        const nextTA = getNextTahunAjaran(tahunAjaran);

        if (nextTingkat) {
          const targetResponse = await superAdminService.getAllKelas({
            isActive: "true",
            tingkat: nextTingkat,
            tahunAjaran: nextTA,
            limit: 1000,
          });
          if (targetResponse.success) {
            setTargetKelasList(targetResponse.data || []);
          }
        }

        setStep(2);
      }
    } catch (error) {
      showToast.error(
        error.response?.data?.message || "Gagal mendapatkan rekomendasi"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (siswaId, newStatus) => {
    setSiswaData((prev) =>
      prev.map((s) => {
        if (s.siswaId === siswaId) {
          let newKelasId = s.toKelasId;

          if (newStatus === "Tinggal Kelas") {
            newKelasId = selectedKelas._id;
          } else if (newStatus === "Lulus") {
            newKelasId = "";
          }

          return {
            ...s,
            status: newStatus,
            toKelasId: newKelasId,
          };
        }
        return s;
      })
    );
  };

  const handleKelasChange = (siswaId, newKelasId) => {
    setSiswaData((prev) =>
      prev.map((s) =>
        s.siswaId === siswaId ? { ...s, toKelasId: newKelasId } : s
      )
    );
  };

  const handleProcessPromotion = async () => {
    const invalidData = siswaData.filter(
      (s) => s.status !== "Lulus" && !s.toKelasId
    );
    if (invalidData.length > 0) {
      showToast.error(
        `${invalidData.length} siswa belum memiliki kelas tujuan. Pastikan semua siswa yang naik/tinggal kelas memiliki kelas tujuan.`
      );
      return;
    }

    // Warning jika ada siswa yang perlu review manual
    const needsReview = siswaData.filter((s) => s.needsManualReview);
    if (needsReview.length > 0) {
      const confirmed = window.confirm(
        `${needsReview.length} siswa memiliki data tidak lengkap dan memerlukan review manual. Apakah Anda yakin ingin melanjutkan proses kenaikan kelas?`
      );
      if (!confirmed) return;
    }

    setIsLoading(true);
    try {
      const payload = {
        fromKelasId: selectedKelas._id,
        tahunAjaran,
        siswaData: siswaData.map((s) => ({
          siswaId: s.siswaId,
          status: s.status,
          toKelasId: s.status !== "Lulus" ? s.toKelasId : undefined,
        })),
      };

      const response = await superAdminService.processPromotion(payload);

      if (response.success) {
        showToast.success("Proses kenaikan kelas berhasil!");
        setStep(3);
      }
    } catch (error) {
      showToast.error(
        error.response?.data?.message || "Gagal memproses kenaikan kelas"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetProcess = () => {
    setStep(1);
    setSelectedKelas(null);
    setRecommendations(null);
    setSiswaData([]);
    setDataAvailability(null);
    fetchKelas();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Naik Kelas":
        return "bg-green-100 text-green-700 border-green-300";
      case "Tinggal Kelas":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "Lulus":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "Perlu Review Manual":
        return "bg-orange-100 text-orange-700 border-orange-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00a3d4] to-[#005f8b] flex items-center justify-center shadow-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-text">
              Kenaikan Kelas & Kelulusan
            </h1>
            <p className="text-neutral-secondary mt-1">
              Kelola proses kenaikan kelas dan kelulusan siswa
            </p>
          </div>
        </div>
      </motion.div>

      {/* Warning jika bukan semester genap */}
      {!canProcessPromotion && settings && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="mb-6 border-2 border-yellow-500 bg-yellow-50">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-yellow-900 mb-2">
                  Kenaikan Kelas Belum Dapat Dilakukan
                </h3>
                <div className="space-y-1 text-sm text-yellow-800">
                  <p>
                    <strong>Semester Aktif:</strong> {settings.semesterAktif}
                  </p>
                  <p>
                    <strong>Tahun Ajaran:</strong> {settings.tahunAjaranAktif}
                  </p>
                  <p className="mt-2">
                    Kenaikan kelas hanya dapat dilakukan di{" "}
                    <strong>akhir semester genap</strong>. Silakan ubah
                    pengaturan semester di menu Settings.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Progress Steps */}
      {canProcessPromotion && (
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: "Pilih Kelas" },
              { num: 2, label: "Review & Edit" },
              { num: 3, label: "Selesai" },
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center flex-1">
                <div
                  className={`flex items-center gap-3 ${
                    idx < 2 ? "flex-1" : ""
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                      step >= s.num
                        ? "bg-primary-main text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {step > s.num ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      s.num
                    )}
                  </div>
                  <span
                    className={`font-medium ${
                      step >= s.num ? "text-neutral-text" : "text-gray-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < 2 && (
                  <ArrowRight
                    className={`w-5 h-5 mx-4 ${
                      step > s.num ? "text-primary-main" : "text-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Step 1: Pilih Kelas */}
      {step === 1 && canProcessPromotion && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <h2 className="text-xl font-bold mb-6 text-neutral-text">
              Pilih Kelas dan Periode
            </h2>
            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">Informasi Penting:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-800">
                    <li>
                      Kenaikan kelas memproses data{" "}
                      <strong>setahun penuh</strong> (semester ganjil + genap)
                    </li>
                    <li>
                      Tahun ajaran diambil otomatis dari pengaturan sistem
                    </li>
                    <li>
                      Sistem akan memberikan rekomendasi berdasarkan nilai dan
                      kehadiran
                    </li>
                    <li>
                      Anda dapat mengubah rekomendasi secara manual di step
                      berikutnya
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Kelas <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedKelas?._id || ""}
                  onChange={(e) => {
                    const kelas = kelasList.find(
                      (k) => k._id === e.target.value
                    );
                    setSelectedKelas(kelas);
                  }}
                  className="w-full px-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main"
                >
                  <option value="">Pilih Kelas</option>
                  {kelasList.map((k) => (
                    <option key={k._id} value={k._id}>
                      {k.nama} - {k.tingkat} {k.jurusan} (T.A {k.tahunAjaran})
                    </option>
                  ))}
                </select>
                {selectedKelas && (
                  <p className="text-xs text-gray-500 mt-2">
                    Jumlah siswa: {selectedKelas.jumlahSiswa || 0} siswa
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Tahun Ajaran
                </label>
                <input
                  type="text"
                  value={tahunAjaran}
                  disabled
                  className="w-full px-4 py-2 border border-neutral-border rounded-lg bg-gray-50 cursor-not-allowed text-gray-600"
                />
                <p className="text-xs text-gray-500 mt-2">
                  <Info className="w-3 h-3 inline mr-1" />
                  Otomatis dari tahun ajaran aktif sistem
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Semester
                </label>
                <input
                  type="text"
                  value={semester.charAt(0).toUpperCase() + semester.slice(1)}
                  disabled
                  className="w-full px-4 py-2 border border-neutral-border rounded-lg bg-gray-50 cursor-not-allowed text-gray-600"
                />
                <p className="text-xs text-green-600 mt-2 font-medium">
                  <CheckCircle2 className="w-3 h-3 inline mr-1" />
                  Memenuhi syarat untuk kenaikan kelas
                </p>
              </div>
            </div>

            <button
              onClick={handleGetRecommendations}
              disabled={isLoading || !selectedKelas}
              className="w-full py-3 bg-gradient-to-br from-[#00a3d4] to-[#005f8b] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Dapatkan Rekomendasi
                </>
              )}
            </button>
          </Card>
        </motion.div>
      )}

      {/* Step 2: Review */}
      {step === 2 && recommendations && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Data Availability Warning */}
          {dataAvailability &&
            (!dataAvailability.hasAttendanceData ||
              !dataAvailability.hasNilaiData) && (
              <Card className="mb-6 border-2 border-orange-500 bg-orange-50">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-bold text-orange-900 mb-2">
                      Perhatian: Data Akademik Tidak Lengkap
                    </h3>
                    <div className="space-y-2 text-sm text-orange-800">
                      <p>{dataAvailability.message}</p>
                      <div className="flex gap-4 mt-3">
                        {!dataAvailability.hasAttendanceData && (
                          <div className="flex items-center gap-2 bg-orange-100 px-3 py-2 rounded-lg">
                            <Database className="w-4 h-4" />
                            <span className="font-medium">
                              Data Kehadiran: Belum Ada
                            </span>
                          </div>
                        )}
                        {!dataAvailability.hasNilaiData && (
                          <div className="flex items-center gap-2 bg-orange-100 px-3 py-2 rounded-lg">
                            <Database className="w-4 h-4" />
                            <span className="font-medium">
                              Data Nilai: Belum Ada
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="mt-3 font-medium">
                        Harap lakukan review manual untuk setiap siswa sebelum
                        memproses kenaikan kelas.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

          {/* Summary Card */}
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-neutral-text">
                Ringkasan Rekomendasi
              </h2>
              <div className="flex gap-2 flex-wrap">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Naik:{" "}
                  {siswaData.filter((s) => s.status === "Naik Kelas").length}
                </span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Tinggal:{" "}
                  {siswaData.filter((s) => s.status === "Tinggal Kelas").length}
                </span>
                {selectedKelas?.tingkat === "XII" && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-1">
                    <GraduationCap className="w-4 h-4" />
                    Lulus:{" "}
                    {siswaData.filter((s) => s.status === "Lulus").length}
                  </span>
                )}
                {siswaData.filter((s) => s.needsManualReview).length > 0 && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    Perlu Review:{" "}
                    {siswaData.filter((s) => s.needsManualReview).length}
                  </span>
                )}
              </div>
            </div>

            <div className="bg-neutral-surface p-4 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-neutral-secondary">Kelas</p>
                  <p className="font-semibold">{recommendations.kelas.nama}</p>
                </div>
                <div>
                  <p className="text-neutral-secondary">Tingkat</p>
                  <p className="font-semibold">
                    {recommendations.kelas.tingkat}{" "}
                    {recommendations.kelas.jurusan}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-secondary">Total Siswa</p>
                  <p className="font-semibold">{siswaData.length} siswa</p>
                </div>
                <div>
                  <p className="text-neutral-secondary">Tahun Ajaran</p>
                  <p className="font-semibold">
                    {recommendations.kelas.tahunAjaran}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Siswa List */}
          <Card>
            <h3 className="font-bold mb-4 text-lg">Review Data Siswa</h3>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {siswaData.map((siswa, idx) => (
                <div
                  key={siswa.siswaId}
                  className={`p-4 border rounded-lg transition-colors ${
                    siswa.needsManualReview
                      ? "border-orange-300 bg-orange-50"
                      : "border-neutral-border hover:border-primary-main"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-neutral-text">
                          {idx + 1}. {siswa.nama}
                        </span>
                        <span className="text-xs text-neutral-secondary">
                          NIS: {siswa.nis}
                        </span>
                        {siswa.needsManualReview && (
                          <span className="text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full font-medium">
                            Perlu Review Manual
                          </span>
                        )}
                      </div>

                      {/* Rekap Singkat */}
                      <div className="flex gap-4 text-xs text-neutral-secondary mt-2 flex-wrap">
                        <span>
                          Rata-rata:{" "}
                          <strong
                            className={
                              siswa.rekap.hasNilaiData
                                ? "text-neutral-text"
                                : "text-gray-400"
                            }
                          >
                            {siswa.rekap.nilaiRataRata || "N/A"}
                          </strong>
                          {!siswa.rekap.hasNilaiData && (
                            <span className="ml-1 text-orange-600">
                              (Tidak ada data)
                            </span>
                          )}
                        </span>
                        <span>
                          Kehadiran:{" "}
                          <strong
                            className={
                              siswa.rekap.hasAttendanceData
                                ? "text-neutral-text"
                                : "text-gray-400"
                            }
                          >
                            {siswa.rekap.attendancePercentage
                              ? `${siswa.rekap.attendancePercentage}%`
                              : "N/A"}
                          </strong>
                          {!siswa.rekap.hasAttendanceData && (
                            <span className="ml-1 text-orange-600">
                              (Tidak ada data)
                            </span>
                          )}
                        </span>
                        {siswa.rekap.hasNilaiData && (
                          <span>
                            Mapel &lt; KKM:{" "}
                            <strong className="text-neutral-text">
                              {siswa.rekap.subjectsBelowPassingGrade}
                            </strong>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                        siswa.status
                      )}`}
                    >
                      {siswa.status}
                    </span>
                  </div>

                  {/* Warnings */}
                  {siswa.warnings && siswa.warnings.length > 0 && (
                    <div className="bg-orange-100 border border-orange-200 p-3 rounded-lg mb-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-orange-900 mb-1">
                            Peringatan:
                          </p>
                          <ul className="list-disc list-inside text-xs text-orange-800 space-y-1">
                            {siswa.warnings.map((warning, wIdx) => (
                              <li key={wIdx}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Reasons */}
                  {siswa.reasons && siswa.reasons.length > 0 && (
                    <div className="bg-neutral-surface p-3 rounded-lg mb-3">
                      <p className="text-xs font-medium text-neutral-secondary mb-1">
                        Alasan Rekomendasi:
                      </p>
                      <ul className="list-disc list-inside text-xs text-neutral-text space-y-1">
                        {siswa.reasons.map((reason, rIdx) => (
                          <li key={rIdx}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Form Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1 text-neutral-secondary">
                        Status
                      </label>
                      <select
                        value={siswa.status}
                        onChange={(e) =>
                          handleStatusChange(siswa.siswaId, e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main"
                      >
                        <option value="Naik Kelas">Naik Kelas</option>
                        <option value="Tinggal Kelas">Tinggal Kelas</option>
                        {selectedKelas?.tingkat === "XII" && (
                          <option value="Lulus">Lulus</option>
                        )}
                      </select>
                    </div>

                    <div>
                      {siswa.status !== "Lulus" && (
                        <>
                          <label className="block text-xs font-medium mb-1 text-neutral-secondary">
                            Kelas Tujuan <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={siswa.toKelasId}
                            onChange={(e) =>
                              handleKelasChange(siswa.siswaId, e.target.value)
                            }
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main ${
                              !siswa.toKelasId
                                ? "border-red-300 bg-red-50"
                                : "border-neutral-border"
                            }`}
                          >
                            <option value="">Pilih Kelas</option>
                            {siswa.status === "Tinggal Kelas" ? (
                              <option value={selectedKelas._id}>
                                {selectedKelas.nama} (Tahun Depan)
                              </option>
                            ) : (
                              targetKelasList.map((k) => (
                                <option key={k._id} value={k._id}>
                                  {k.nama} - {k.tingkat} {k.jurusan}
                                </option>
                              ))
                            )}
                          </select>
                          {!siswa.toKelasId && (
                            <p className="text-xs text-red-600 mt-1">
                              Kelas tujuan wajib diisi
                            </p>
                          )}
                        </>
                      )}
                      {siswa.status === "Lulus" && (
                        <div className="flex items-center h-full">
                          <p className="text-sm text-neutral-secondary italic">
                            Siswa akan lulus dan dinonaktifkan
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6 pt-6 border-t border-neutral-border">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 border border-neutral-border text-neutral-text rounded-lg hover:bg-neutral-surface transition-colors font-medium"
              >
                Kembali
              </button>
              <button
                onClick={handleProcessPromotion}
                disabled={isLoading}
                className="flex-1 py-3 bg-gradient-to-br from-[#00a3d4] to-[#005f8b] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Proses Kenaikan Kelas ({siswaData.length} Siswa)
                  </>
                )}
              </button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Step 3: Success */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="text-center py-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>

            <h2 className="text-3xl font-bold text-neutral-text mb-2">
              Proses Berhasil!
            </h2>

            <p className="text-neutral-secondary mb-6 text-lg">
              Kenaikan kelas telah diproses untuk{" "}
              <strong>{siswaData.length} siswa</strong>
            </p>

            {/* Summary */}
            <div className="max-w-md mx-auto mb-8">
              <div className="bg-neutral-surface rounded-lg p-6">
                <h3 className="font-semibold mb-4 text-neutral-text">
                  Ringkasan:
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {
                        siswaData.filter((s) => s.status === "Naik Kelas")
                          .length
                      }
                    </div>
                    <div className="text-sm text-neutral-secondary">
                      Naik Kelas
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600 mb-1">
                      {
                        siswaData.filter((s) => s.status === "Tinggal Kelas")
                          .length
                      }
                    </div>
                    <div className="text-sm text-neutral-secondary">
                      Tinggal Kelas
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {siswaData.filter((s) => s.status === "Lulus").length}
                    </div>
                    <div className="text-sm text-neutral-secondary">Lulus</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={resetProcess}
                className="px-8 py-3 bg-gradient-to-br from-[#00a3d4] to-[#005f8b] text-white rounded-lg hover:opacity-90 transition-opacity font-semibold shadow-md"
              >
                Proses Kelas Lain
              </button>
              <button
                onClick={() => (window.location.href = "/super-admin/kelas")}
                className="px-8 py-3 border border-neutral-border text-neutral-text rounded-lg hover:bg-neutral-surface transition-colors font-medium"
              >
                Kembali ke Manajemen Kelas
              </button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
