// src/app/login/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Scan, Eye, EyeOff, Lock, User } from "lucide-react";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect jika sudah login
  useEffect(() => {
    if (!authLoading && user) {
      const dashboardPath = getDashboardPathByRole(user.role);
      router.replace(dashboardPath);
    }
  }, [user, authLoading, router]);

  const getDashboardPathByRole = (role) => {
    switch (role) {
      case "super-admin":
        return "/super-admin/dashboard";
      case "guru":
        return "/guru/dashboard";
      case "siswa":
        return "/siswa/dashboard";
      default:
        return "/";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login({ identifier, password });
      // Login function di AuthContext sudah handle redirect
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login gagal. Periksa kembali NIP/NISN dan password Anda."
      );
    } finally {
      setLoading(false);
    }
  };

  // Jika masih checking auth, tampilkan loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Memuat...</p>
        </div>
      </div>
    );
  }

  // Jika sudah login, jangan tampilkan form
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 to-cyan-500 p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div className="relative z-10 text-white max-w-md">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Scan size={32} />
            </div>
            <h1 className="text-4xl font-bold">SMKScan</h1>
          </div>
          <h2 className="text-3xl font-bold mb-4">
            Sistem Manajemen Sekolah Modern
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Platform terintegrasi untuk mengelola kehadiran, nilai, dan
            administrasi sekolah dengan teknologi QR Code.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                ✓
              </div>
              <span>Absensi Real-time dengan QR Code</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                ✓
              </div>
              <span>Dashboard Interaktif</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                ✓
              </div>
              <span>Laporan Lengkap & Akurat</span>
            </div>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute left-0 bottom-0 w-96 h-96 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo for Mobile */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Scan className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-900">SMKScan</span>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Selamat Datang
              </h2>
              <p className="text-gray-600">
                Masuk ke akun Anda untuk melanjutkan
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NIP / NISN / Username
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Masukkan NIP/NISN"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Masukkan password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Memproses...
                  </span>
                ) : (
                  "Masuk"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <a
                href="/"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Kembali ke Beranda
              </a>
            </div>
          </div>

          <p className="text-center text-gray-600 text-sm mt-6">
            Belum punya akun?{" "}
            <a
              href="#"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Hubungi Admin
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
