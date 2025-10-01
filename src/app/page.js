// src/app/page.js
"use client";
import Link from "next/link";
import {
  Scan,
  Users,
  BookOpen,
  Calendar,
  CheckCircle,
  Shield,
  Zap,
  BarChart3,
  ArrowRight,
  GraduationCap,
  ChevronDown,
} from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: Scan,
      title: "Absensi QR Code",
      description: "Sistem absensi modern dengan QR Code yang cepat dan akurat",
    },
    {
      icon: Users,
      title: "Manajemen User",
      description:
        "Kelola guru, siswa, dan admin dengan mudah dalam satu platform",
    },
    {
      icon: BookOpen,
      title: "Mata Pelajaran",
      description: "Atur mata pelajaran dan kurikulum sekolah dengan efisien",
    },
    {
      icon: Calendar,
      title: "Jadwal Otomatis",
      description: "Buat dan kelola jadwal pelajaran secara otomatis",
    },
    {
      icon: BarChart3,
      title: "Laporan Real-time",
      description: "Pantau kehadiran dan performa siswa secara real-time",
    },
    {
      icon: Shield,
      title: "Keamanan Terjamin",
      description: "Data terenkripsi dan sistem keamanan berlapis",
    },
  ];

  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Scan className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-900">SMKScan</span>
          </div>
          <Link
            href="/login"
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all font-medium"
          >
            Login
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
                🚀 Platform Manajemen Sekolah Modern
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Sistem Manajemen
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
                  SMK Digital
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Kelola kehadiran, nilai, dan administrasi sekolah dengan mudah
                menggunakan teknologi QR Code dan dashboard terintegrasi.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/login"
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-xl transition-all font-semibold text-lg flex items-center justify-center gap-2"
                >
                  Mulai Sekarang
                  <ArrowRight size={20} />
                </Link>
                <button
                  onClick={scrollToFeatures}
                  className="px-8 py-4 bg-white text-gray-900 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all font-semibold text-lg"
                >
                  Pelajari Lebih Lanjut
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-3xl blur-3xl opacity-20"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 space-y-6">
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <Scan className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Absensi Real-time
                    </p>
                    <p className="text-sm text-gray-600">Scan QR dalam detik</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <BarChart3 className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Dashboard Lengkap
                    </p>
                    <p className="text-sm text-gray-600">
                      Monitor semua aktivitas
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Shield className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Keamanan Tinggi
                    </p>
                    <p className="text-sm text-gray-600">Data terproteksi</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <button
            onClick={scrollToFeatures}
            className="animate-bounce p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all"
          >
            <ChevronDown className="text-blue-500" size={32} />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Fitur Unggulan
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Semua yang Anda butuhkan untuk mengelola sekolah modern dalam satu
              platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all group"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl p-12 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-4">
                Siap Modernisasi Sekolah Anda?
              </h2>
              <p className="text-xl mb-8 text-white/90">
                Bergabunglah dengan sekolah-sekolah yang sudah menggunakan
                SMKScan
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl hover:shadow-xl transition-all font-bold text-lg"
              >
                Mulai Sekarang
                <ArrowRight size={20} />
              </Link>
            </div>
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute left-0 bottom-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Scan className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold">SMKScan</span>
          </div>
          <p className="text-gray-400 mb-4">
            Platform manajemen sekolah SMK modern dan terintegrasi
          </p>
          <div className="border-t border-gray-800 pt-8 text-gray-400">
            <p>&copy; 2025 SMKScan. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
