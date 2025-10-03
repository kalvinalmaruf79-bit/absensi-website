"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LogOut, ChevronDown } from "lucide-react";

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format role display
  const getRoleDisplay = (role) => {
    if (role === "super_admin" || role === "super-admin") return "Super Admin";
    if (role === "guru") return "Guru";
    if (role === "siswa") return "Siswa";
    return role;
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Side - Greeting */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-800">
            Selamat Datang, <span className="text-[#00a3d4]">{user?.name}</span>
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Right Side - User Menu */}
        <div className="flex items-center">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00a3d4]/30 focus:ring-offset-2 group"
              aria-label="Menu pengguna"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00a3d4] to-[#00b2e2] flex items-center justify-center text-white font-semibold text-sm shadow-md ring-2 ring-[#00a3d4]/20 group-hover:ring-[#00a3d4]/40 transition-all">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-semibold text-gray-900">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500">
                  {getRoleDisplay(user?.role)}
                </p>
              </div>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform duration-200 ${
                  showDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {/* User Info */}
                <div className="p-4 bg-gradient-to-r from-[#00a3d4]/5 to-[#00b2e2]/5 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00a3d4] to-[#00b2e2] flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {user?.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 px-3 py-1.5 bg-white/80 rounded-lg inline-block">
                    <p className="text-xs font-medium text-[#00a3d4]">
                      {getRoleDisplay(user?.role)}
                    </p>
                  </div>
                </div>

                {/* Logout */}
                <div className="p-2">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-all font-medium"
                  >
                    <LogOut size={18} />
                    <span className="text-sm">Keluar</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
