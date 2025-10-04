// src/app/(dashboard)/guru/dashboard/page.js
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Users,
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Megaphone,
  Loader2,
} from "lucide-react";
import Card from "@/components/ui/Card";
import { guruService } from "@/services/guru.service";
import { showToast } from "@/lib/toast";

// Komponen StatCard
const StatCard = ({ icon, title, value, subtitle, color = "primary" }) => {
  const colorClasses = {
    primary: "from-[#00a3d4] to-[#005f8b]",
    success: "from-[#4caf50] to-[#388e3c]",
    warning: "from-[#ff9800] to-[#f57c00]",
    danger: "from-[#e53935] to-[#c62828]",
  };

  return (
    <Card className="hover:shadow-hover transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-neutral-secondary mb-1">{title}</p>
          <p className="text-3xl font-bold text-neutral-text mb-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-neutral-tertiary">{subtitle}</p>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-md`}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
};

// Komponen JadwalCard
const JadwalCard = ({ jadwal }) => (
  <div className="flex items-center gap-4 p-4 bg-neutral-light/10 rounded-lg hover:bg-neutral-light/20 transition-colors">
    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#00a3d4] to-[#005f8b] flex items-center justify-center shadow-md">
      <Clock className="w-6 h-6 text-white" />
    </div>
    <div className="flex-1">
      <h4 className="font-semibold text-neutral-text">
        {jadwal.mataPelajaran?.nama || "Mata Pelajaran"}
      </h4>
      <p className="text-sm text-neutral-secondary">
        {jadwal.kelas?.nama || "Kelas"} • {jadwal.jamMulai} -{" "}
        {jadwal.jamSelesai}
      </p>
    </div>
    <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
      {jadwal.jamMulai}
    </div>
  </div>
);

// Komponen PengumumanCard
const PengumumanCard = ({ pengumuman }) => (
  <div className="flex gap-4 p-4 border-l-4 border-primary bg-primary/5 rounded-r-lg hover:bg-primary/10 transition-colors">
    <Megaphone className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
    <div className="flex-1">
      <h4 className="font-semibold text-neutral-text mb-1">
        {pengumuman.judul}
      </h4>
      <p className="text-sm text-neutral-secondary line-clamp-2">
        {pengumuman.konten}
      </p>
      <div className="flex items-center gap-2 mt-2 text-xs text-neutral-tertiary">
        <span>{pengumuman.pembuat?.name || "Admin"}</span>
        <span>•</span>
        <span>
          {new Date(pengumuman.createdAt).toLocaleDateString("id-ID")}
        </span>
      </div>
    </div>
  </div>
);

// Main Dashboard Component
export default function GuruDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const response = await guruService.getDashboard();

        if (response.success || response.guru) {
          setDashboardData(response);
        } else {
          showToast.error(response.message || "Gagal memuat dashboard");
        }
      } catch (error) {
        console.error("Error fetching dashboard:", error);
        showToast.error(
          error.response?.data?.message ||
            "Gagal memuat data dashboard. Silakan coba lagi."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-secondary">
          Tidak dapat memuat data dashboard
        </p>
      </div>
    );
  }

  const { guru, jadwalHariIni, pengumumanTerbaru, statistik } = dashboardData;
  const totalAbsensi = Object.values(statistik.absensiBulanIni).reduce(
    (a, b) => a + b,
    0
  );
  const persentaseHadir =
    totalAbsensi > 0
      ? Math.round((statistik.absensiBulanIni.hadir / totalAbsensi) * 100)
      : 0;

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-text mb-1">
              Selamat Datang, {guru.name.split(",")[0]}!
            </h1>
            <p className="text-neutral-secondary">{guru.identifier}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-neutral-tertiary">
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-lg font-semibold text-primary">
              {new Date().toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Statistik Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <StatCard
          icon={<BookOpen className="w-6 h-6 text-white" />}
          title="Mata Pelajaran"
          value={statistik.totalMataPelajaran}
          subtitle={
            guru.mataPelajaran?.length > 0
              ? guru.mataPelajaran.map((m) => m.nama).join(", ")
              : "Tidak ada"
          }
          color="primary"
        />
        <StatCard
          icon={<Users className="w-6 h-6 text-white" />}
          title="Total Kelas"
          value={statistik.totalKelas}
          subtitle="Kelas aktif"
          color="success"
        />
        <StatCard
          icon={<Users className="w-6 h-6 text-white" />}
          title="Total Siswa"
          value={statistik.totalSiswa}
          subtitle="Siswa diampu"
          color="warning"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6 text-white" />}
          title="Kehadiran"
          value={`${persentaseHadir}%`}
          subtitle="Bulan ini"
          color="success"
        />
      </motion.div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Jadwal Hari Ini */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-neutral-text">
                Jadwal Mengajar Hari Ini
              </h2>
            </div>
            {jadwalHariIni && jadwalHariIni.length > 0 ? (
              <div className="space-y-3">
                {jadwalHariIni.map((jadwal) => (
                  <JadwalCard key={jadwal._id} jadwal={jadwal} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-secondary">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Tidak ada jadwal mengajar hari ini</p>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Rekap Absensi */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="w-6 h-6 text-success" />
              <h2 className="text-xl font-bold text-neutral-text">
                Rekap Absensi
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="font-medium text-neutral-text">Hadir</span>
                </div>
                <span className="text-xl font-bold text-success">
                  {statistik.absensiBulanIni.hadir}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-warning" />
                  <span className="font-medium text-neutral-text">Izin</span>
                </div>
                <span className="text-xl font-bold text-warning">
                  {statistik.absensiBulanIni.izin}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-info/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-info" />
                  <span className="font-medium text-neutral-text">Sakit</span>
                </div>
                <span className="text-xl font-bold text-info">
                  {statistik.absensiBulanIni.sakit}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-danger/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-danger" />
                  <span className="font-medium text-neutral-text">Alpa</span>
                </div>
                <span className="text-xl font-bold text-danger">
                  {statistik.absensiBulanIni.alpa}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Pengumuman */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6"
      >
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <Megaphone className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-neutral-text">
              Pengumuman Terbaru
            </h2>
          </div>
          {pengumumanTerbaru && pengumumanTerbaru.length > 0 ? (
            <div className="space-y-4">
              {pengumumanTerbaru.map((pengumuman) => (
                <PengumumanCard key={pengumuman._id} pengumuman={pengumuman} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-secondary">
              <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Tidak ada pengumuman terbaru</p>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
