// src/app/(auth)/layout.js
"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function AuthLayout({ children }) {
  const { user, loading, redirectToDashboard } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      redirectToDashboard(user.role);
    }
  }, [user, loading, redirectToDashboard]);

  if (loading || user) {
    // Tampilkan loading spinner atau null selama proses cek auth atau jika user sudah login
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#f5faff" }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: "#00a3d4" }}
          ></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  // Tampilkan children (halaman login) jika tidak loading dan tidak ada user
  return children;
}
