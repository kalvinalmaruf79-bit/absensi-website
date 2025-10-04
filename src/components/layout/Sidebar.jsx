"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Book,
  School,
  Calendar,
  ArrowUpRight,
  Megaphone,
  Settings,
  ChevronDown,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Presentation,
  UserCheck,
} from "lucide-react";

// --- Komponen Submenu untuk Dropdown ---
const SubMenu = ({ menu, pathname, isCollapsed }) => {
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(
    pathname.startsWith(menu.basePath)
  );

  useEffect(() => {
    if (pathname.startsWith(menu.basePath)) {
      setIsSubMenuOpen(true);
    }
  }, [pathname, menu.basePath]);

  return (
    <div>
      <div
        onClick={() => setIsSubMenuOpen(!isSubMenuOpen)}
        className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer text-gray-600 hover:bg-gray-100 hover:text-gray-900`}
        title={isCollapsed ? menu.title : ""}
      >
        <div className="flex items-center gap-3">
          <span className="flex-shrink-0">{menu.icon}</span>
          {!isCollapsed && (
            <span className="font-medium text-sm whitespace-nowrap overflow-hidden">
              {menu.title}
            </span>
          )}
        </div>
        {!isCollapsed && (
          <motion.div
            animate={{ rotate: isSubMenuOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {!isCollapsed && isSubMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.3, ease: "easeInOut" },
              opacity: { duration: 0.2, ease: "linear" },
            }}
            className="pl-8 mt-1 space-y-1"
          >
            {menu.children.map((child, index) => {
              const isActive = pathname === child.path;
              return (
                <Link key={index} href={child.path}>
                  <motion.div
                    whileHover={{ x: 2 }}
                    className={`block px-4 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "font-semibold text-primary bg-primary/10"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {child.title}
                  </motion.div>
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Komponen Utama Sidebar ---
export default function Sidebar({
  isCollapsed: isCollapsedProp,
  setIsCollapsed: setIsCollapsedProp,
}) {
  const pathname = usePathname();
  const { user } = useAuth();

  const [localCollapsed, setLocalCollapsed] = useState(false);
  const effectiveIsCollapsed =
    typeof isCollapsedProp === "boolean" ? isCollapsedProp : localCollapsed;
  const setEffectiveIsCollapsed =
    typeof setIsCollapsedProp === "function"
      ? setIsCollapsedProp
      : setLocalCollapsed;

  // --- Definisi Menu ---

  const superAdminMenus = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: "/super-admin/dashboard",
    },
    {
      title: "Manajemen User",
      icon: <Users className="w-5 h-5" />,
      path: "/super-admin/users",
    },
    {
      title: "Mata Pelajaran",
      icon: <Book className="w-5 h-5" />,
      path: "/super-admin/mata-pelajaran",
    },
    {
      title: "Kelas",
      icon: <School className="w-5 h-5" />,
      path: "/super-admin/kelas",
    },
    {
      title: "Jadwal",
      icon: <Calendar className="w-5 h-5" />,
      path: "/super-admin/jadwal",
    },
    {
      title: "Kenaikan Kelas",
      icon: <ArrowUpRight className="w-5 h-5" />,
      path: "/super-admin/academic-cycle",
    },
    {
      title: "Pengumuman",
      icon: <Megaphone className="w-5 h-5" />,
      path: "/super-admin/pengumuman",
    },
    {
      title: "Pengaturan",
      icon: <Settings className="w-5 h-5" />,
      path: "/super-admin/settings",
    },
  ];

  const baseGuruMenus = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: "/guru/dashboard",
    },
    {
      title: "Kelas Saya",
      icon: <School className="w-5 h-5" />,
      basePath: "/guru/kelas",
      children: [
        { title: "Daftar Kelas", path: "/guru/kelas" },
        { title: "Materi Ajar", path: "/guru/kelas/materi" },
        { title: "Tugas & Ujian", path: "/guru/kelas/tugas" },
        { title: "Input Nilai", path: "/guru/kelas/nilai" },
        { title: "Presensi", path: "/guru/kelas/presensi" },
      ],
    },
    {
      title: "Jadwal Mengajar",
      icon: <Calendar className="w-5 h-5" />,
      path: "/guru/jadwal",
    },
    {
      title: "Analisis Siswa",
      icon: <GraduationCap className="w-5 h-5" />,
      path: "/guru/analisis",
    },
  ];

  const guruMenus = [...baseGuruMenus];

  // Logika untuk menambahkan menu Wali Kelas secara dinamis
  if (user?.isWaliKelas) {
    guruMenus.push({
      title: "Wali Kelas",
      icon: <UserCheck className="w-5 h-5" />,
      basePath: "/guru/wali-kelas",
      children: [
        { title: "Daftar Siswa", path: "/guru/wali-kelas/siswa" },
        { title: "Validasi Absensi", path: "/guru/wali-kelas/absensi" },
        { title: "Catatan & Rapor", path: "/guru/wali-kelas/rapor" },
      ],
    });
  }

  const menus = user?.role === "super_admin" ? superAdminMenus : guruMenus;

  return (
    <motion.aside
      role="navigation"
      aria-label="Sidebar"
      data-collapsed={effectiveIsCollapsed ? "true" : "false"}
      initial={false}
      animate={{
        width: effectiveIsCollapsed ? "5rem" : "16rem",
      }}
      transition={{
        type: "spring",
        stiffness: 280,
        damping: 30,
        mass: 0.6,
      }}
      className="fixed left-0 top-0 h-screen bg-white border-r border-gray-200 z-50 shadow-lg flex flex-col"
    >
      {/* Logo */}
      <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
        <AnimatePresence>
          {!effectiveIsCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-[#00b2e2] to-[#005f8b] rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div>
                <h1 className="font-bold text-gray-800">SMKScan</h1>
                <p className="text-xs text-gray-500">Nanga Pinoh</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          aria-label={
            effectiveIsCollapsed ? "Expand sidebar" : "Collapse sidebar"
          }
          aria-pressed={effectiveIsCollapsed}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setEffectiveIsCollapsed(!effectiveIsCollapsed)}
          className="group p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#00a3d4]/30 focus:ring-offset-1"
        >
          <motion.svg
            animate={{ rotate: effectiveIsCollapsed ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="w-5 h-5 text-gray-600 group-hover:text-gray-800"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </motion.svg>
        </motion.button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menus.map((menu, index) => {
          if (menu.children) {
            return (
              <SubMenu
                key={index}
                menu={menu}
                pathname={pathname}
                isCollapsed={effectiveIsCollapsed}
              />
            );
          }

          const isActive = pathname === menu.path;
          return (
            <Link key={index} href={menu.path}>
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.995 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-[#00a3d4] to-[#00b2e2] text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
                title={effectiveIsCollapsed ? menu.title : ""}
              >
                <span className="flex-shrink-0">{menu.icon}</span>
                <AnimatePresence>
                  {!effectiveIsCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="font-medium text-sm whitespace-nowrap overflow-hidden"
                    >
                      {menu.title}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="flex-shrink-0">
        <AnimatePresence>
          {!effectiveIsCollapsed && user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="p-4 border-t border-gray-200 bg-white"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#00a3d4] to-[#005f8b] rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-semibold">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-800 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.role === "super_admin" ? "Super Admin" : "Guru"}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
