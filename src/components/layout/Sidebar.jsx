// ==========================================
// FILE 7: src/components/layout/Sidebar.jsx
// ==========================================
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  Calendar,
  Settings,
  ClipboardList,
  FileText,
  BarChart3,
  QrCode,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  School,
  Menu,
  X,
} from "lucide-react";

const MenuItem = ({ item, isActive, isOpen, onClick }) => {
  const hasChildren = item.children && item.children.length > 0;
  const pathname = usePathname();

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => onClick(item.id)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
            isActive
              ? "bg-blue-50 text-blue-600 font-medium"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center gap-3">
            <item.icon size={20} />
            <span>{item.label}</span>
          </div>
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        {isOpen && (
          <div className="ml-4 mt-1 space-y-1">
            {item.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all ${
                  pathname === child.href
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-current" />
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        isActive
          ? "bg-blue-50 text-blue-600 font-medium"
          : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      <item.icon size={20} />
      <span>{item.label}</span>
    </Link>
  );
};

export default function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState({});
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const superAdminMenus = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/super-admin/dashboard",
    },
    {
      id: "users",
      label: "Manajemen User",
      icon: Users,
      children: [
        { label: "Daftar User", href: "/super-admin/users" },
        { label: "Tambah User", href: "/super-admin/users/create" },
      ],
    },
    {
      id: "mapel",
      label: "Mata Pelajaran",
      icon: BookOpen,
      children: [
        { label: "Daftar Mapel", href: "/super-admin/mata-pelajaran" },
      ],
    },
    {
      id: "kelas",
      label: "Manajemen Kelas",
      icon: GraduationCap,
      children: [{ label: "Daftar Kelas", href: "/super-admin/kelas" }],
    },
    {
      id: "jadwal",
      label: "Jadwal Pelajaran",
      icon: Calendar,
      href: "/super-admin/jadwal",
    },
    {
      id: "settings",
      label: "Pengaturan",
      icon: Settings,
      href: "/super-admin/settings",
    },
  ];

  const guruMenus = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/guru/dashboard",
    },
    {
      id: "jadwal",
      label: "Jadwal Mengajar",
      icon: Calendar,
      href: "/guru/jadwal",
    },
    {
      id: "nilai",
      label: "Penilaian",
      icon: BarChart3,
      children: [
        { label: "Daftar Nilai", href: "/guru/nilai" },
        { label: "Input Nilai", href: "/guru/nilai/input" },
      ],
    },
    {
      id: "absensi",
      label: "Absensi",
      icon: CheckSquare,
      children: [
        { label: "Riwayat Absensi", href: "/guru/absensi" },
        { label: "Generate QR", href: "/guru/absensi/qr" },
      ],
    },
    {
      id: "materi",
      label: "Materi Ajar",
      icon: FileText,
      children: [
        { label: "Daftar Materi", href: "/guru/materi" },
        { label: "Tambah Materi", href: "/guru/materi/create" },
      ],
    },
    {
      id: "tugas",
      label: "Tugas",
      icon: ClipboardList,
      children: [
        { label: "Daftar Tugas", href: "/guru/tugas" },
        { label: "Buat Tugas", href: "/guru/tugas/create" },
      ],
    },
    {
      id: "wali-kelas",
      label: "Wali Kelas",
      icon: Users,
      href: "/guru/wali-kelas",
    },
  ];

  const menus = user?.role === "super-admin" ? superAdminMenus : guruMenus;

  const toggleMenu = (menuId) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const checkIsActive = (item) => {
    if (item.href) return pathname === item.href;
    if (item.children) {
      return item.children.some((child) => pathname === child.href);
    }
    return false;
  };

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
        style={{ color: "#00a3d4" }}
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen w-72 bg-white border-r border-gray-200 
          transition-transform duration-300 z-40 flex flex-col
          ${
            isMobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #00b2e2 0%, #005f8b 100%)",
              }}
            >
              <School className="text-white" size={24} />
            </div>
            <div>
              <h1 className="font-bold text-lg" style={{ color: "#00a3d4" }}>
                SMKScan
              </h1>
              <p className="text-xs text-gray-500">
                {user?.role === "super-admin" ? "Super Admin" : "Portal Guru"}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menus.map((item) => (
            <MenuItem
              key={item.id}
              item={item}
              isActive={checkIsActive(item)}
              isOpen={openMenus[item.id]}
              onClick={toggleMenu}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: "#00a3d4" }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
