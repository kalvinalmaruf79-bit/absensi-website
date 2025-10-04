// src/app/(dashboard)/guru/kelas/materi/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  BookOpen,
  Loader2,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  FileText,
  Link as LinkIcon,
  Calendar,
  List,
} from "lucide-react";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/shared/EmptyState";
import { materiService } from "@/services/materi.service";
import { guruService } from "@/services/guru.service";
import { showToast } from "@/lib/toast";

export default function MateriPage() {
  const router = useRouter();
  const [materiList, setMateriList] = useState([]);
  const [allMateriList, setAllMateriList] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingKelas, setIsLoadingKelas] = useState(true);
  const [viewMode, setViewMode] = useState("all"); // "all" or "filtered"
  const [filters, setFilters] = useState({
    kelasId: "",
    mataPelajaranId: "",
    search: "",
  });
  const [selectedMateri, setSelectedMateri] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch kelas yang diampu guru
  const fetchKelas = useCallback(async () => {
    setIsLoadingKelas(true);
    try {
      const jadwal = await guruService.getJadwalGuru();
      const uniqueKelas = [];
      const kelasMap = new Map();

      Object.values(jadwal).forEach((jadwalHari) => {
        jadwalHari.forEach((item) => {
          if (item.kelas && !kelasMap.has(item.kelas._id)) {
            kelasMap.set(item.kelas._id, {
              ...item.kelas,
              mataPelajaran: [item.mataPelajaran],
            });
            uniqueKelas.push({
              ...item.kelas,
              mataPelajaran: [item.mataPelajaran],
            });
          } else if (item.kelas && kelasMap.has(item.kelas._id)) {
            const existingKelas = kelasMap.get(item.kelas._id);
            const hasMataPelajaran = existingKelas.mataPelajaran.some(
              (mp) => mp._id === item.mataPelajaran._id
            );
            if (!hasMataPelajaran) {
              existingKelas.mataPelajaran.push(item.mataPelajaran);
            }
          }
        });
      });

      const finalKelasList = Array.from(kelasMap.values());
      setKelasList(finalKelasList);
    } catch (error) {
      console.error("Error fetching kelas:", error);
      showToast.error("Gagal memuat data kelas");
    } finally {
      setIsLoadingKelas(false);
    }
  }, []);

  // Fetch semua materi guru tanpa filter
  const fetchAllMateri = useCallback(async () => {
    setIsLoading(true);
    try {
      // Ambil semua materi dari semua kelas dan mata pelajaran yang diampu
      const allMateriPromises = [];

      kelasList.forEach((kelas) => {
        kelas.mataPelajaran.forEach((mapel) => {
          allMateriPromises.push(
            materiService.getMateri({
              kelasId: kelas._id,
              mataPelajaranId: mapel._id,
            })
          );
        });
      });

      const results = await Promise.all(allMateriPromises);
      const combinedMateri = results.flat();

      // Remove duplicates based on _id
      const uniqueMateri = Array.from(
        new Map(combinedMateri.map((item) => [item._id, item])).values()
      );

      setAllMateriList(uniqueMateri);
      setMateriList(uniqueMateri);
    } catch (error) {
      console.error("Error fetching all materi:", error);
      showToast.error("Gagal memuat data materi");
      setAllMateriList([]);
      setMateriList([]);
    } finally {
      setIsLoading(false);
    }
  }, [kelasList]);

  // Fetch materi berdasarkan filter
  const fetchFilteredMateri = useCallback(async () => {
    if (!filters.kelasId || !filters.mataPelajaranId) {
      return;
    }

    setIsLoading(true);
    try {
      const data = await materiService.getMateri({
        kelasId: filters.kelasId,
        mataPelajaranId: filters.mataPelajaranId,
      });

      setMateriList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching materi:", error);
      showToast.error("Gagal memuat data materi");
      setMateriList([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters.kelasId, filters.mataPelajaranId]);

  useEffect(() => {
    fetchKelas();
  }, [fetchKelas]);

  useEffect(() => {
    if (kelasList.length > 0 && viewMode === "all") {
      fetchAllMateri();
    }
  }, [kelasList, viewMode, fetchAllMateri]);

  useEffect(() => {
    if (viewMode === "filtered" && filters.kelasId && filters.mataPelajaranId) {
      fetchFilteredMateri();
    }
  }, [viewMode, filters.kelasId, filters.mataPelajaranId, fetchFilteredMateri]);

  const handleTogglePublish = async (id) => {
    try {
      const response = await materiService.togglePublishMateri(id);
      showToast.success(response.message);

      // Refresh based on current view mode
      if (viewMode === "all") {
        fetchAllMateri();
      } else {
        fetchFilteredMateri();
      }
    } catch (error) {
      console.error("Error toggling publish:", error);
      showToast.error("Gagal mengubah status publikasi");
    }
  };

  const handleDeleteClick = (materi) => {
    setSelectedMateri(materi);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedMateri) return;

    try {
      const response = await materiService.deleteMateri(selectedMateri._id);
      showToast.success(response.message);
      setShowDeleteModal(false);
      setSelectedMateri(null);

      // Refresh based on current view mode
      if (viewMode === "all") {
        fetchAllMateri();
      } else {
        fetchFilteredMateri();
      }
    } catch (error) {
      console.error("Error deleting materi:", error);
      showToast.error("Gagal menghapus materi");
    }
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (mode === "all") {
      setFilters({ kelasId: "", mataPelajaranId: "", search: "" });
    }
  };

  const filteredMateri = materiList.filter((materi) => {
    if (!filters.search) return true;
    const searchLower = filters.search.toLowerCase();
    return (
      materi.judul?.toLowerCase().includes(searchLower) ||
      materi.deskripsi?.toLowerCase().includes(searchLower)
    );
  });

  const selectedKelas = kelasList.find((k) => k._id === filters.kelasId);
  const mataPelajaranList = selectedKelas?.mataPelajaran || [];

  const handleRefresh = () => {
    if (viewMode === "all") {
      fetchAllMateri();
    } else if (filters.kelasId && filters.mataPelajaranId) {
      fetchFilteredMateri();
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00a3d4] to-[#005f8b] flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-text">
                Manajemen Materi Ajar
              </h1>
              <p className="text-neutral-secondary mt-1">
                Kelola materi pembelajaran Anda
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-4 py-2 border border-neutral-border text-neutral-text rounded-lg hover:bg-neutral-surface transition-colors flex items-center gap-2 font-medium disabled:opacity-50"
            >
              <RefreshCw
                className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <button
              onClick={() => router.push("/guru/kelas/materi/create")}
              className="px-6 py-2 bg-gradient-to-br from-[#00a3d4] to-[#005f8b] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 font-semibold shadow-md"
            >
              <Plus className="w-5 h-5" />
              Tambah Materi
            </button>
          </div>
        </div>
      </motion.div>

      {/* View Mode Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-6"
      >
        <div className="flex gap-2 bg-neutral-surface p-1 rounded-lg">
          <button
            onClick={() => handleViewModeChange("all")}
            className={`px-4 py-2 rounded-md transition-all flex items-center gap-2 ${
              viewMode === "all"
                ? "bg-white shadow-sm text-primary-main font-medium"
                : "text-neutral-secondary hover:text-neutral-text"
            }`}
          >
            <List className="w-4 h-4" />
            Semua Materi
          </button>
          <button
            onClick={() => handleViewModeChange("filtered")}
            className={`px-4 py-2 rounded-md transition-all flex items-center gap-2 ${
              viewMode === "filtered"
                ? "bg-white shadow-sm text-primary-main font-medium"
                : "text-neutral-secondary hover:text-neutral-text"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </motion.div>

      {/* Filters - Only show when filtered mode */}
      {viewMode === "filtered" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="w-5 h-5 text-neutral-secondary" />
              <h3 className="text-lg font-semibold text-neutral-text">
                Filter & Pencarian
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={filters.kelasId}
                onChange={(e) => {
                  setFilters((prev) => ({
                    ...prev,
                    kelasId: e.target.value,
                    mataPelajaranId: "",
                  }));
                }}
                disabled={isLoadingKelas}
                className="px-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main bg-white disabled:opacity-50"
              >
                <option value="">
                  {isLoadingKelas ? "Memuat..." : "Pilih Kelas"}
                </option>
                {kelasList.map((kelas) => (
                  <option key={kelas._id} value={kelas._id}>
                    {kelas.nama}
                  </option>
                ))}
              </select>

              <select
                value={filters.mataPelajaranId}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    mataPelajaranId: e.target.value,
                  }))
                }
                disabled={!filters.kelasId || isLoadingKelas}
                className="px-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main bg-white disabled:opacity-50"
              >
                <option value="">Pilih Mata Pelajaran</option>
                {mataPelajaranList.map((mapel) => (
                  <option key={mapel._id} value={mapel._id}>
                    {mapel.nama}
                  </option>
                ))}
              </select>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-secondary" />
                <input
                  type="text"
                  placeholder="Cari materi..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="w-full pl-10 pr-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main"
                />
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Search only - For all mode */}
      {viewMode === "all" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-secondary" />
              <input
                type="text"
                placeholder="Cari materi..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="w-full pl-10 pr-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main"
              />
            </div>
          </Card>
        </motion.div>
      )}

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          {viewMode === "filtered" &&
          (!filters.kelasId || !filters.mataPelajaranId) ? (
            <EmptyState
              icon={<Filter className="w-16 h-16 text-neutral-secondary" />}
              title="Pilih Kelas dan Mata Pelajaran"
              description="Silakan pilih kelas dan mata pelajaran terlebih dahulu untuk melihat materi."
            />
          ) : isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary-main animate-spin" />
            </div>
          ) : filteredMateri.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="w-16 h-16 text-neutral-secondary" />}
              title="Belum Ada Materi"
              description={
                viewMode === "all"
                  ? "Anda belum membuat materi apapun. Silakan tambah materi baru."
                  : "Belum ada materi untuk kelas dan mata pelajaran ini."
              }
            />
          ) : (
            <div className="space-y-4">
              {filteredMateri.map((materi, index) => (
                <motion.div
                  key={materi._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-neutral-border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-neutral-text">
                          {materi.judul}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            materi.isPublished
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {materi.isPublished ? "Terbit" : "Draft"}
                        </span>
                        {viewMode === "all" &&
                          materi.kelas &&
                          materi.mataPelajaran && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                              {materi.kelas.nama} - {materi.mataPelajaran.nama}
                            </span>
                          )}
                      </div>
                      <p className="text-neutral-secondary text-sm mb-3">
                        {materi.deskripsi}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-neutral-secondary">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(materi.createdAt).toLocaleDateString(
                            "id-ID"
                          )}
                        </div>
                        {materi.files?.length > 0 && (
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {materi.files.length} File
                          </div>
                        )}
                        {materi.links?.length > 0 && (
                          <div className="flex items-center gap-1">
                            <LinkIcon className="w-4 h-4" />
                            {materi.links.length} Link
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTogglePublish(materi._id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title={materi.isPublished ? "Sembunyikan" : "Terbitkan"}
                      >
                        {materi.isPublished ? (
                          <EyeOff className="w-5 h-5 text-gray-600" />
                        ) : (
                          <Eye className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                      <button
                        onClick={() =>
                          router.push(`/guru/kelas/materi/edit/${materi._id}`)
                        }
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(materi)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>

                  {/* Files and Links */}
                  {(materi.files?.length > 0 || materi.links?.length > 0) && (
                    <div className="mt-4 pt-4 border-t border-neutral-border space-y-3">
                      {materi.files?.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-neutral-text mb-2">
                            File Lampiran:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {materi.files.map((file, idx) => (
                              <a
                                key={idx}
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition-colors flex items-center gap-2"
                              >
                                <FileText className="w-4 h-4" />
                                {file.fileName}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      {materi.links?.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-neutral-text mb-2">
                            Link Referensi:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {materi.links.map((link, idx) => (
                              <a
                                key={idx}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm hover:bg-green-100 transition-colors flex items-center gap-2"
                              >
                                <LinkIcon className="w-4 h-4" />
                                {link.title}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl"
            >
              <h3 className="text-xl font-bold text-neutral-text mb-2">
                Konfirmasi Hapus
              </h3>
              <p className="text-neutral-secondary mb-6">
                Apakah Anda yakin ingin menghapus materi "
                {selectedMateri?.judul}"? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-neutral-border rounded-lg hover:bg-neutral-surface transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Hapus
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
