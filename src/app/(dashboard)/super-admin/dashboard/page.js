// src/app/(dashboard)/super-admin/dashboard/page.js
"use client";

import { useEffect, useState } from "react";
import { superAdminService } from "@/services/super-admin.service";
import {
  Users,
  BookOpen,
  Calendar,
  GraduationCap,
  TrendingUp,
  Activity,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await superAdminService.getDashboard();
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Guru",
      value: stats?.totalGuru || 0,
      icon: Users,
      color: "#00a3d4",
      bgColor: "rgba(0, 163, 212, 0.1)",
      gradient: "from-[#00a3d4] to-[#00b2e2]",
    },
    {
      title: "Total Siswa",
      value: stats?.totalSiswa || 0,
      icon: GraduationCap,
      color: "#4caf50",
      bgColor: "rgba(76, 175, 80, 0.1)",
      gradient: "from-[#4caf50] to-[#66bb6a]",
    },
    {
      title: "Mata Pelajaran",
      value: stats?.totalMataPelajaran || 0,
      icon: BookOpen,
      color: "#ff9800",
      bgColor: "rgba(255, 152, 0, 0.1)",
      gradient: "from-[#ff9800] to-[#ffa726]",
    },
    {
      title: "Total Kelas",
      value: stats?.totalKelas || 0,
      icon: Calendar,
      color: "#e53935",
      bgColor: "rgba(229, 57, 53, 0.1)",
      gradient: "from-[#e53935] to-[#ef5350]",
    },
  ];

  const quickActions = [
    { icon: Users, label: "Tambah User", color: "#00a3d4" },
    { icon: BookOpen, label: "Mata Pelajaran", color: "#ff9800" },
    { icon: GraduationCap, label: "Kelola Kelas", color: "#4caf50" },
    { icon: Calendar, label: "Atur Jadwal", color: "#e53935" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3"
        >
          <div className="w-2 h-2 rounded-full bg-[#00a3d4] animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-[#00a3d4] animate-pulse [animation-delay:0.2s]" />
          <div className="w-2 h-2 rounded-full bg-[#00a3d4] animate-pulse [animation-delay:0.4s]" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
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
            Selamat Datang, Super Admin
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-white/90"
          >
            Kelola sistem SMKScan dengan mudah dan efisien
          </motion.p>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute right-20 bottom-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2" />
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.4 }}
            whileHover={{ y: -2, transition: { duration: 0.12 } }}
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
                  delay: index * 0.08 + 0.2,
                  type: "spring",
                  stiffness: 240,
                  damping: 22,
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
              transition={{ delay: index * 0.08 + 0.4 }}
              className="text-4xl font-bold"
              style={{ color: card.color }}
            >
              {card.value}
            </motion.p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Aktivitas Terbaru
            </h2>
            <Activity size={20} className="text-[#00a3d4]" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.08, duration: 0.25 }}
                whileHover={{ x: 2, transition: { duration: 0.12 } }}
                className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00a3d4] to-[#005f8b] flex items-center justify-center text-white font-semibold shadow-md">
                  A
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-[#00a3d4] transition-colors">
                    Admin menambahkan guru baru
                  </p>
                  <p className="text-xs text-gray-500 mt-1">2 jam yang lalu</p>
                </div>
                <ArrowRight
                  size={16}
                  className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Aksi Cepat</h2>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.08, duration: 0.2 }}
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.99 }}
                className="p-5 rounded-xl border-2 border-gray-200 hover:border-[#00a3d4] hover:shadow-lg transition-all text-left group"
              >
                <action.icon
                  size={28}
                  className="mb-3 group-hover:scale-110 transition-transform"
                  style={{ color: action.color }}
                />
                <p className="font-medium text-gray-900 text-sm group-hover:text-[#00a3d4] transition-colors">
                  {action.label}
                </p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
