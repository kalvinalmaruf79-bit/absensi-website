// src/app/(dashboard)/guru/dashboard/page.js
"use client";

import { useEffect, useState } from "react";
import { guruService } from "@/services/guru.service";
import {
  Users,
  BookOpen,
  Calendar,
  GraduationCap,
  TrendingUp,
  Activity,
} from "lucide-react";

export default function GuruDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await guruService.getDashboard();
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Siswa",
      value: stats?.totalSiswa || 0,
      icon: GraduationCap,
      color: "#4caf50",
      bgColor: "rgba(76, 175, 80, 0.1)",
    },
    {
      title: "Mata Pelajaran",
      value: stats?.totalMataPelajaran || 0,
      icon: BookOpen,
      color: "#ff9800",
      bgColor: "rgba(255, 152, 0, 0.1)",
    },
    {
      title: "Total Kelas",
      value: stats?.totalKelas || 0,
      icon: Calendar,
      color: "#e53935",
      bgColor: "rgba(229, 57, 53, 0.1)",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div
          className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "#00a3d4" }}
        ></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div
        className="rounded-2xl p-8 text-white relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #00b2e2 0%, #005f8b 100%)",
        }}
      >
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Selamat Datang, Guru</h1>
          <p className="text-white/90">
            Kelola sistem SMKScan dengan mudah dan efisien
          </p>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: card.bgColor }}
              >
                <card.icon size={24} style={{ color: card.color }} />
              </div>
              <TrendingUp size={20} className="text-green-500" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">
              {card.title}
            </h3>
            <p className="text-3xl font-bold" style={{ color: card.color }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Aktivitas Terbaru
            </h2>
            <Activity size={20} style={{ color: "#00a3d4" }} />
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: "#00a3d4" }}
                >
                  A
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Admin menambahkan guru baru
                  </p>
                  <p className="text-xs text-gray-500 mt-1">2 jam yang lalu</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Aksi Cepat</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-left">
              <Users size={24} className="mb-2" style={{ color: "#00a3d4" }} />
              <p className="font-medium text-gray-900 text-sm">Input Nilai</p>
            </button>
            <button className="p-4 rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-left">
              <BookOpen
                size={24}
                className="mb-2"
                style={{ color: "#00a3d4" }}
              />
              <p className="font-medium text-gray-900 text-sm">
                Buat Tugas Baru
              </p>
            </button>
            <button className="p-4 rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-left">
              <GraduationCap
                size={24}
                className="mb-2"
                style={{ color: "#00a3d4" }}
              />
              <p className="font-medium text-gray-900 text-sm">
                Generate QR Absensi
              </p>
            </button>
            <button className="p-4 rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-left">
              <Calendar
                size={24}
                className="mb-2"
                style={{ color: "#00a3d4" }}
              />
              <p className="font-medium text-gray-900 text-sm">
                Lihat Jadwal Mengajar
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
