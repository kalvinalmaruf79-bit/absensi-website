"use client";
import { useEffect, useState, useRef } from "react";
import { superAdminService } from "@/services/super-admin.service";
import {
  Users,
  BookOpen,
  Calendar,
  GraduationCap,
  TrendingUp,
  Activity,
  Clock,
  UserCheck,
  BookMarked,
  ClipboardList,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import Chart from "chart.js/auto";

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const lineChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const barChartRef = useRef(null);
  const attendanceChartRef = useRef(null);

  const lineChartInstance = useRef(null);
  const pieChartInstance = useRef(null);
  const barChartInstance = useRef(null);
  const attendanceChartInstance = useRef(null);

  useEffect(() => {
    fetchDashboardData();

    return () => {
      if (lineChartInstance.current) lineChartInstance.current.destroy();
      if (pieChartInstance.current) pieChartInstance.current.destroy();
      if (barChartInstance.current) barChartInstance.current.destroy();
      if (attendanceChartInstance.current)
        attendanceChartInstance.current.destroy();
    };
  }, []);

  useEffect(() => {
    if (stats && !loading) {
      createCharts();
    }
  }, [stats, loading]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await superAdminService.getDashboard();
      setStats(response.statistik);
      setError(null);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      setError("Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const date = new Date(dateString);
    return days[date.getDay()];
  };

  const createCharts = () => {
    if (lineChartInstance.current) lineChartInstance.current.destroy();
    if (pieChartInstance.current) pieChartInstance.current.destroy();
    if (barChartInstance.current) barChartInstance.current.destroy();
    if (attendanceChartInstance.current)
      attendanceChartInstance.current.destroy();

    // Chart 1: Aktivitas Pengguna (Line Chart)
    if (lineChartRef.current && stats.aktivitasPengguna) {
      const labels = stats.aktivitasPengguna.map((item) =>
        formatDate(item._id)
      );
      const guruData = stats.aktivitasPengguna.map((item) => {
        const guru = item.activities.find((a) => a.role === "guru");
        return guru ? guru.count : 0;
      });
      const siswaData = stats.aktivitasPengguna.map((item) => {
        const siswa = item.activities.find((a) => a.role === "siswa");
        return siswa ? siswa.count : 0;
      });

      lineChartInstance.current = new Chart(lineChartRef.current, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Guru",
              data: guruData,
              borderColor: "#00a3d4",
              backgroundColor: "rgba(0, 163, 212, 0.1)",
              tension: 0.4,
              borderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
            {
              label: "Siswa",
              data: siswaData,
              borderColor: "#4caf50",
              backgroundColor: "rgba(76, 175, 80, 0.1)",
              tension: 0.4,
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
              display: true,
              position: "top",
            },
            tooltip: {
              mode: "index",
              intersect: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: "#f0f0f0",
              },
            },
            x: {
              grid: {
                display: false,
              },
            },
          },
        },
      });
    }

    // Chart 2: Distribusi Pengguna (Pie Chart)
    if (pieChartRef.current && stats.utama) {
      pieChartInstance.current = new Chart(pieChartRef.current, {
        type: "doughnut",
        data: {
          labels: ["Guru", "Siswa", "Admin"],
          datasets: [
            {
              data: [stats.utama.totalGuru, stats.utama.totalSiswa, 1],
              backgroundColor: ["#00a3d4", "#4caf50", "#ff9800"],
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
              position: "bottom",
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  const label = context.label || "";
                  const value = context.parsed || 0;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${label}: ${value} (${percentage}%)`;
                },
              },
            },
          },
        },
      });
    }

    // Chart 3: Distribusi Kelas (Bar Chart)
    if (barChartRef.current && stats.distribusiKelas) {
      const labels = stats.distribusiKelas.map(
        (item) => `Tingkat ${item.tingkat}`
      );
      const data = stats.distribusiKelas.map((item) => item.count);

      barChartInstance.current = new Chart(barChartRef.current, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Jumlah Kelas",
              data: data,
              backgroundColor: "#00a3d4",
              borderRadius: 8,
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
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },
              grid: {
                color: "#f0f0f0",
              },
            },
            x: {
              grid: {
                display: false,
              },
            },
          },
        },
      });
    }

    // Chart 4: Tren Absensi (Line Chart)
    if (attendanceChartRef.current && stats.trenAbsensi) {
      const labels = stats.trenAbsensi.map((item) => formatDate(item.date));
      const hadirData = stats.trenAbsensi.map((item) => item.rekap.hadir || 0);
      const sakitData = stats.trenAbsensi.map((item) => item.rekap.sakit || 0);
      const izinData = stats.trenAbsensi.map((item) => item.rekap.izin || 0);
      const alpaData = stats.trenAbsensi.map((item) => item.rekap.alpa || 0);

      attendanceChartInstance.current = new Chart(attendanceChartRef.current, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Hadir",
              data: hadirData,
              borderColor: "#4caf50",
              backgroundColor: "rgba(76, 175, 80, 0.1)",
              tension: 0.4,
              borderWidth: 2,
              pointRadius: 3,
            },
            {
              label: "Sakit",
              data: sakitData,
              borderColor: "#ff9800",
              backgroundColor: "rgba(255, 152, 0, 0.1)",
              tension: 0.4,
              borderWidth: 2,
              pointRadius: 3,
            },
            {
              label: "Izin",
              data: izinData,
              borderColor: "#2196f3",
              backgroundColor: "rgba(33, 150, 243, 0.1)",
              tension: 0.4,
              borderWidth: 2,
              pointRadius: 3,
            },
            {
              label: "Alpa",
              data: alpaData,
              borderColor: "#e53935",
              backgroundColor: "rgba(229, 57, 53, 0.1)",
              tension: 0.4,
              borderWidth: 2,
              pointRadius: 3,
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
            },
            tooltip: {
              mode: "index",
              intersect: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              stacked: false,
              grid: {
                color: "#f0f0f0",
              },
            },
            x: {
              grid: {
                display: false,
              },
            },
          },
        },
      });
    }
  };

  if (loading) {
    return (
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
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-[#00a3d4] text-white rounded-lg hover:opacity-90"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Guru",
      value: stats?.utama?.totalGuru || 0,
      icon: Users,
      color: "#00a3d4",
      gradient: "from-[#00a3d4] to-[#00b2e2]",
    },
    {
      title: "Total Siswa",
      value: stats?.utama?.totalSiswa || 0,
      icon: GraduationCap,
      color: "#4caf50",
      gradient: "from-[#4caf50] to-[#66bb6a]",
    },
    {
      title: "Mata Pelajaran",
      value: stats?.utama?.totalMataPelajaran || 0,
      icon: BookOpen,
      color: "#ff9800",
      gradient: "from-[#ff9800] to-[#ffa726]",
    },
    {
      title: "Total Kelas",
      value: stats?.utama?.totalKelas || 0,
      icon: Calendar,
      color: "#e53935",
      gradient: "from-[#e53935] to-[#ef5350]",
    },
    {
      title: "Konten Minggu Ini",
      value:
        (stats?.kontenDibuat?.tugas || 0) + (stats?.kontenDibuat?.materi || 0),
      icon: BookMarked,
      color: "#9c27b0",
      gradient: "from-[#9c27b0] to-[#ab47bc]",
    },
    {
      title: "Total Pengguna",
      value: stats?.utama?.totalPengguna || 0,
      icon: UserCheck,
      color: "#2196f3",
      gradient: "from-[#2196f3] to-[#42a5f5]",
    },
  ];

  const totalKehadiran = stats?.rasioKehadiran
    ? Object.values(stats.rasioKehadiran).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative rounded-2xl p-8 text-white overflow-hidden shadow-xl"
        style={{
          background: "linear-gradient(135deg, #00b2e2 0%, #005f8b 100%)",
        }}
      >
        <div className="relative z-10">
          <motion.h1
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12, duration: 0.4 }}
            className="text-3xl font-bold mb-2"
          >
            Dashboard Super Admin
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-white/90"
          >
            Monitoring dan kelola sistem SMKScan secara terpusat
          </motion.p>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute right-20 bottom-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2" />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.3 }}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-md`}
              >
                <card.icon size={28} className="text-white" />
              </div>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: index * 0.06 + 0.15,
                  type: "spring",
                  stiffness: 200,
                }}
              >
                <TrendingUp size={20} className="text-green-500" />
              </motion.div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-2">
              {card.title}
            </h3>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.06 + 0.3 }}
              className="text-4xl font-bold"
              style={{ color: card.color }}
            >
              {card.value}
            </motion.p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Aktivitas Pengguna
              </h2>
              <p className="text-sm text-gray-500 mt-1">7 hari terakhir</p>
            </div>
            <Activity size={20} className="text-[#00a3d4]" />
          </div>
          <div className="h-[280px]">
            <canvas ref={lineChartRef}></canvas>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Distribusi Pengguna
              </h2>
              <p className="text-sm text-gray-500 mt-1">Komposisi sistem</p>
            </div>
            <Users size={20} className="text-[#00a3d4]" />
          </div>
          <div className="h-[280px] flex items-center justify-center">
            <canvas ref={pieChartRef}></canvas>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Distribusi Kelas
              </h2>
              <p className="text-sm text-gray-500 mt-1">Per tingkat</p>
            </div>
            <Calendar size={20} className="text-[#00a3d4]" />
          </div>
          <div className="h-[280px]">
            <canvas ref={barChartRef}></canvas>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Tren Absensi</h2>
              <p className="text-sm text-gray-500 mt-1">7 hari terakhir</p>
            </div>
            <UserCheck size={20} className="text-[#00a3d4]" />
          </div>
          <div className="h-[280px]">
            <canvas ref={attendanceChartRef}></canvas>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.3 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Ringkasan Sistem</h2>
          <ClipboardList size={20} className="text-[#00a3d4]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.65 }}
            className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                <BookOpen size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Rata-rata Mapel/Guru</p>
                <p className="text-lg font-bold text-gray-900">
                  {stats?.utama?.totalGuru > 0
                    ? (
                        stats.utama.totalMataPelajaran / stats.utama.totalGuru
                      ).toFixed(1)
                    : 0}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-green-50 to-green-100 border border-green-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                <GraduationCap size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Rata-rata Siswa/Kelas</p>
                <p className="text-lg font-bold text-gray-900">
                  {stats?.utama?.totalKelas > 0
                    ? Math.round(
                        stats.utama.totalSiswa / stats.utama.totalKelas
                      )
                    : 0}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.75 }}
            className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                <BookMarked size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Konten Minggu Ini</p>
                <p className="text-lg font-bold text-gray-900">
                  {(stats?.kontenDibuat?.tugas || 0) +
                    (stats?.kontenDibuat?.materi || 0)}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                <UserCheck size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tingkat Kehadiran</p>
                <p className="text-lg font-bold text-gray-900">
                  {totalKehadiran > 0
                    ? (
                        (stats.rasioKehadiran.hadir / totalKehadiran) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
