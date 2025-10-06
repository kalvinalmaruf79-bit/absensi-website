"use client";
import { useEffect, useState, useRef } from "react";
import { guruService } from "@/services/guru.service";
import {
  TrendingUp,
  Award,
  BookOpen,
  AlertCircle,
  ChevronDown,
  UserCheck,
  Clock,
  Target,
  BarChart3,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Chart from "chart.js/auto";

export default function AnalisisKinerja() {
  const [siswaList, setSiswaList] = useState([]);
  const [selectedSiswa, setSelectedSiswa] = useState(null);
  const [analisisData, setAnalisisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const trendChartRef = useRef(null);
  const compareChartRef = useRef(null);
  const radarChartRef = useRef(null);

  const trendChartInstance = useRef(null);
  const compareChartInstance = useRef(null);
  const radarChartInstance = useRef(null);

  const [tahunAjaran] = useState("2024/2025");
  const [semester] = useState("ganjil");

  useEffect(() => {
    fetchSiswaList();

    return () => {
      if (trendChartInstance.current) trendChartInstance.current.destroy();
      if (compareChartInstance.current) compareChartInstance.current.destroy();
      if (radarChartInstance.current) radarChartInstance.current.destroy();
    };
  }, []);

  useEffect(() => {
    if (analisisData && !loading) {
      createCharts();
    }
  }, [analisisData, loading]);

  const fetchSiswaList = async () => {
    try {
      const kelasList = await guruService.getKelasDiampu();
      if (kelasList.length > 0) {
        const allSiswa = [];
        for (const kelas of kelasList) {
          const siswaData = await guruService.getSiswaKelas(kelas._id, {
            limit: 100,
          });
          allSiswa.push(
            ...siswaData.docs.map((s) => ({ ...s, kelasNama: kelas.nama }))
          );
        }
        setSiswaList(allSiswa);
      }
    } catch (error) {
      console.error("Error fetching siswa:", error);
      setError("Gagal memuat daftar siswa");
    }
  };

  const fetchAnalisisData = async (siswaId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await guruService.getAnalisisKinerja({
        siswaId,
        tahunAjaran,
        semester,
      });
      setAnalisisData(response.data);
    } catch (error) {
      console.error("Error fetching analisis:", error);
      setError("Gagal memuat data analisis");
      setAnalisisData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSiswa = (siswa) => {
    setSelectedSiswa(siswa);
    setIsDropdownOpen(false);
    fetchAnalisisData(siswa._id);
  };

  const createCharts = () => {
    if (trendChartInstance.current) trendChartInstance.current.destroy();
    if (compareChartInstance.current) compareChartInstance.current.destroy();
    if (radarChartInstance.current) radarChartInstance.current.destroy();

    // Chart 1: Trend Nilai Per Mata Pelajaran
    if (trendChartRef.current && analisisData?.analisisPerMapel) {
      const labels = analisisData.analisisPerMapel.map((m) => m.namaMapel);
      const nilaiSiswa = analisisData.analisisPerMapel.map(
        (m) => m.rataRataSiswa
      );

      trendChartInstance.current = new Chart(trendChartRef.current, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Rata-rata Nilai",
              data: nilaiSiswa,
              borderColor: "#00a3d4",
              backgroundColor: "rgba(0, 163, 212, 0.1)",
              tension: 0.4,
              borderWidth: 3,
              pointRadius: 5,
              pointHoverRadius: 7,
              pointBackgroundColor: "#00a3d4",
              pointBorderColor: "#fff",
              pointBorderWidth: 2,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              padding: 12,
              titleFont: { size: 14, weight: "bold" },
              bodyFont: { size: 13 },
              callbacks: {
                label: function (context) {
                  return `Nilai: ${context.parsed.y.toFixed(2)}`;
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              grid: {
                color: "#f0f0f0",
              },
              ticks: {
                font: { size: 12 },
              },
            },
            x: {
              grid: {
                display: false,
              },
              ticks: {
                font: { size: 11 },
                maxRotation: 45,
                minRotation: 45,
              },
            },
          },
        },
      });
    }

    // Chart 2: Perbandingan dengan Rata-rata Kelas
    if (compareChartRef.current && analisisData?.analisisPerMapel) {
      const labels = analisisData.analisisPerMapel.map((m) => m.namaMapel);
      const nilaiSiswa = analisisData.analisisPerMapel.map(
        (m) => m.rataRataSiswa
      );
      const nilaiKelas = analisisData.analisisPerMapel.map(
        (m) => m.rataRataKelas
      );

      compareChartInstance.current = new Chart(compareChartRef.current, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Nilai Siswa",
              data: nilaiSiswa,
              backgroundColor: "#00a3d4",
              borderRadius: 8,
              borderWidth: 0,
            },
            {
              label: "Rata-rata Kelas",
              data: nilaiKelas,
              backgroundColor: "#4caf50",
              borderRadius: 8,
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: "top",
              labels: {
                padding: 15,
                font: { size: 12 },
                usePointStyle: true,
              },
            },
            tooltip: {
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              padding: 12,
              titleFont: { size: 14, weight: "bold" },
              bodyFont: { size: 13 },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              grid: {
                color: "#f0f0f0",
              },
              ticks: {
                font: { size: 12 },
              },
            },
            x: {
              grid: {
                display: false,
              },
              ticks: {
                font: { size: 11 },
                maxRotation: 45,
                minRotation: 45,
              },
            },
          },
        },
      });
    }

    // Chart 3: Radar Chart untuk Profil Kemampuan
    if (radarChartRef.current && analisisData?.analisisPerMapel) {
      const labels = analisisData.analisisPerMapel.map((m) => m.namaMapel);
      const nilaiSiswa = analisisData.analisisPerMapel.map(
        (m) => m.rataRataSiswa
      );

      radarChartInstance.current = new Chart(radarChartRef.current, {
        type: "radar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Profil Kemampuan",
              data: nilaiSiswa,
              backgroundColor: "rgba(0, 163, 212, 0.2)",
              borderColor: "#00a3d4",
              pointBackgroundColor: "#00a3d4",
              pointBorderColor: "#fff",
              pointHoverBackgroundColor: "#fff",
              pointHoverBorderColor: "#00a3d4",
              borderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            r: {
              beginAtZero: true,
              max: 100,
              ticks: {
                stepSize: 20,
                font: { size: 11 },
              },
              pointLabels: {
                font: { size: 11 },
              },
              grid: {
                color: "#f0f0f0",
              },
            },
          },
        },
      });
    }
  };

  const getStatusColor = (nilai) => {
    if (nilai >= 85) return "text-green-600 bg-green-50 border-green-200";
    if (nilai >= 75) return "text-blue-600 bg-blue-50 border-blue-200";
    if (nilai >= 65) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getPerformanceLabel = (nilai) => {
    if (nilai >= 85) return "Sangat Baik";
    if (nilai >= 75) return "Baik";
    if (nilai >= 65) return "Cukup";
    return "Perlu Perbaikan";
  };

  return (
    <div className="space-y-6">
      {/* Selector Siswa */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      >
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Pilih Siswa untuk Dianalisis
        </label>
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-[#00a3d4] transition-colors focus:outline-none focus:ring-2 focus:ring-[#00a3d4]/20"
          >
            <span className="text-gray-700">
              {selectedSiswa
                ? `${selectedSiswa.name} (${selectedSiswa.identifier}) - ${selectedSiswa.kelasNama}`
                : "-- Pilih Siswa --"}
            </span>
            <motion.div
              animate={{ rotate: isDropdownOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </motion.div>
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-y-auto"
              >
                {siswaList.map((siswa, index) => (
                  <motion.button
                    key={siswa._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleSelectSiswa(siswa)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <p className="font-medium text-gray-900">{siswa.name}</p>
                    <p className="text-sm text-gray-500">
                      {siswa.identifier} • {siswa.kelasNama}
                    </p>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-2 h-2 rounded-full bg-[#00a3d4] animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-[#00a3d4] animate-pulse [animation-delay:0.2s]" />
            <div className="w-2 h-2 rounded-full bg-[#00a3d4] animate-pulse [animation-delay:0.4s]" />
          </motion.div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center min-h-[400px]"
        >
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Data Display */}
      {analisisData && !loading && (
        <>
          {/* Ringkasan Kinerja */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00a3d4] to-[#005f8b] flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-2">
                Rata-rata Keseluruhan
              </h3>
              <p
                className={`text-4xl font-bold ${
                  getStatusColor(analisisData.kinerjaUmum.rataRataSiswa).split(
                    " "
                  )[0]
                }`}
              >
                {analisisData.kinerjaUmum.rataRataSiswa.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {getPerformanceLabel(analisisData.kinerjaUmum.rataRataSiswa)}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4caf50] to-[#388e3c] flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-2">
                Total Nilai Terinput
              </h3>
              <p className="text-4xl font-bold text-gray-900">
                {analisisData.kinerjaUmum.totalNilaiDiinput}
              </p>
              <p className="text-xs text-gray-500 mt-2">Data penilaian</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ff9800] to-[#f57c00] flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-2">
                Kehadiran
              </h3>
              <p className="text-4xl font-bold text-green-600">
                {analisisData.rekapAbsensi.hadir || 0}
              </p>
              <p className="text-xs text-gray-500 mt-2">Hari hadir</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#e53935] to-[#c62828] flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-2">
                Ketidakhadiran
              </h3>
              <p className="text-4xl font-bold text-red-600">
                {(analisisData.rekapAbsensi.sakit || 0) +
                  (analisisData.rekapAbsensi.izin || 0) +
                  (analisisData.rekapAbsensi.alpa || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                S: {analisisData.rekapAbsensi.sakit || 0} • I:{" "}
                {analisisData.rekapAbsensi.izin || 0} • A:{" "}
                {analisisData.rekapAbsensi.alpa || 0}
              </p>
            </motion.div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Trend Nilai
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Per mata pelajaran
                  </p>
                </div>
                <BarChart3 className="w-5 h-5 text-[#00a3d4]" />
              </div>
              <div className="h-[300px]">
                <canvas ref={trendChartRef}></canvas>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Perbandingan dengan Kelas
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Siswa vs rata-rata kelas
                  </p>
                </div>
                <Target className="w-5 h-5 text-[#00a3d4]" />
              </div>
              <div className="h-[300px]">
                <canvas ref={compareChartRef}></canvas>
              </div>
            </motion.div>
          </div>

          {/* Radar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Profil Kemampuan
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Visualisasi kekuatan per mata pelajaran
                </p>
              </div>
              <Award className="w-5 h-5 text-[#00a3d4]" />
            </div>
            <div className="h-[400px] flex items-center justify-center">
              <canvas ref={radarChartRef}></canvas>
            </div>
          </motion.div>

          {/* Detail Per Mata Pelajaran */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Detail Per Mata Pelajaran
            </h2>
            <div className="space-y-4">
              {analisisData.analisisPerMapel.map((mapel, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.85 + index * 0.05 }}
                  className={`p-4 rounded-xl border-2 ${getStatusColor(
                    mapel.rataRataSiswa
                  )}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {mapel.namaMapel}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="text-gray-600">
                          Nilai Siswa:{" "}
                          <span className="font-bold">
                            {mapel.rataRataSiswa.toFixed(2)}
                          </span>
                        </span>
                        <span className="text-gray-600">
                          Rata-rata Kelas:{" "}
                          <span className="font-bold">
                            {mapel.rataRataKelas.toFixed(2)}
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {mapel.rataRataSiswa.toFixed(0)}
                      </p>
                      <p className="text-xs">
                        {getPerformanceLabel(mapel.rataRataSiswa)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}

      {/* Empty State */}
      {!selectedSiswa && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center min-h-[400px] text-center"
        >
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <BarChart3 className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Pilih Siswa untuk Melihat Analisis
          </h3>
          <p className="text-gray-500 max-w-md">
            Pilih siswa dari dropdown di atas untuk melihat analisis kinerja
            akademik secara detail
          </p>
        </motion.div>
      )}
    </div>
  );
}
