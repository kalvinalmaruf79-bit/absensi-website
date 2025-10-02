// src/components/super-admin/AssignGuruModal.jsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Trash2, Search, Users } from "lucide-react";
import { superAdminService } from "@/services/super-admin.service";
import { showToast } from "@/lib/toast";

export default function AssignGuruModal({ isOpen, onClose, mataPelajaran }) {
  const [availableGuru, setAvailableGuru] = useState([]);
  const [assignedGuru, setAssignedGuru] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (isOpen && mataPelajaran) {
      fetchData();
    }
  }, [isOpen, mataPelajaran]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [guruResponse, mapelDetail] = await Promise.all([
        superAdminService.getAllUsers({ role: "guru", limit: 1000 }),
        superAdminService.getMataPelajaranById(mataPelajaran._id),
      ]);

      const allGuru = guruResponse.docs || [];
      const assigned = mapelDetail.guru || [];

      setAssignedGuru(assigned);
      setAvailableGuru(
        allGuru.filter((guru) => !assigned.some((a) => a._id === guru._id))
      );
    } catch (error) {
      showToast.error("Gagal memuat data guru");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async (guruId) => {
    setActionLoading(guruId);
    try {
      await superAdminService.assignGuruMataPelajaran({
        mataPelajaranId: mataPelajaran._id,
        guruId,
      });
      showToast.success("Guru berhasil ditugaskan");
      await fetchData();
    } catch (error) {
      showToast.error(error.response?.data?.message || "Gagal menugaskan guru");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnassign = async (guruId) => {
    setActionLoading(guruId);
    try {
      await superAdminService.unassignGuruMataPelajaran({
        mataPelajaranId: mataPelajaran._id,
        guruId,
      });
      showToast.success("Penugasan guru berhasil dihapus");
      await fetchData();
    } catch (error) {
      showToast.error(
        error.response?.data?.message || "Gagal menghapus penugasan"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const filteredAvailable = availableGuru.filter(
    (guru) =>
      guru.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guru.identifier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen || !mataPelajaran) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-primary-main to-primary-darkest px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <Users className="w-6 h-6" />
                <div>
                  <h2 className="text-xl font-bold">Kelola Guru Pengampu</h2>
                  <p className="text-sm text-white/80 mt-1">
                    {mataPelajaran.nama} ({mataPelajaran.kode})
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-3 border-primary-main/30 border-t-primary-main rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Guru Tersedia */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-neutral-text">
                      Guru Tersedia
                    </h3>
                    <span className="text-sm text-neutral-secondary">
                      {filteredAvailable.length} guru
                    </span>
                  </div>

                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-secondary" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari guru..."
                      className="w-full pl-10 pr-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main/20 text-sm"
                    />
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredAvailable.length === 0 ? (
                      <p className="text-center text-neutral-secondary py-8 text-sm">
                        Tidak ada guru tersedia
                      </p>
                    ) : (
                      filteredAvailable.map((guru) => (
                        <motion.div
                          key={guru._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-3 border border-neutral-border rounded-lg flex items-center justify-between hover:bg-neutral-surface/50 transition-colors"
                        >
                          <div>
                            <p className="font-medium text-neutral-text text-sm">
                              {guru.name}
                            </p>
                            <p className="text-xs text-neutral-secondary">
                              NIP: {guru.identifier}
                            </p>
                          </div>
                          <button
                            onClick={() => handleAssign(guru._id)}
                            disabled={actionLoading === guru._id}
                            className="p-2 rounded-lg bg-primary-main/10 text-primary-main hover:bg-primary-main/20 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === guru._id ? (
                              <div className="w-4 h-4 border-2 border-primary-main/30 border-t-primary-main rounded-full animate-spin" />
                            ) : (
                              <UserPlus className="w-4 h-4" />
                            )}
                          </button>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>

                {/* Guru Ditugaskan */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-neutral-text">
                      Guru Ditugaskan
                    </h3>
                    <span className="text-sm text-neutral-secondary">
                      {assignedGuru.length} guru
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[26.5rem] overflow-y-auto">
                    {assignedGuru.length === 0 ? (
                      <div className="border-2 border-dashed border-neutral-border rounded-lg p-8 text-center">
                        <Users className="w-12 h-12 text-neutral-secondary mx-auto mb-3" />
                        <p className="text-neutral-secondary text-sm">
                          Belum ada guru ditugaskan
                        </p>
                      </div>
                    ) : (
                      assignedGuru.map((guru) => (
                        <motion.div
                          key={guru._id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-3 bg-primary-main/5 border border-primary-main/20 rounded-lg flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium text-neutral-text text-sm">
                              {guru.name}
                            </p>
                            <p className="text-xs text-neutral-secondary">
                              NIP: {guru.identifier}
                            </p>
                          </div>
                          <button
                            onClick={() => handleUnassign(guru._id)}
                            disabled={actionLoading === guru._id}
                            className="p-2 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === guru._id ? (
                              <div className="w-4 h-4 border-2 border-danger/30 border-t-danger rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-neutral-border px-6 py-4">
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 bg-neutral-surface text-neutral-text rounded-lg hover:bg-neutral-border transition-colors font-medium"
            >
              Selesai
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
