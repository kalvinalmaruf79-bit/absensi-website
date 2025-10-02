// src/app/(dashboard)/super-admin/mata-pelajaran/[id]/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Users,
  Edit,
  Trash2,
  UserPlus,
  Loader2,
  Calendar,
  User,
} from "lucide-react";
import MataPelajaranFormModal from "@/components/super-admin/MataPelajaranFormModal";
import AssignGuruModal from "@/components/super-admin/AssignGuruModal";
import DeleteMataPelajaranModal from "@/components/super-admin/DeleteMataPelajaranModal";
import { superAdminService } from "@/services/super-admin.service";
import { showToast } from "@/lib/toast";
import Card from "@/components/ui/Card";

export default function MataPelajaranDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [mataPelajaran, setMataPelajaran] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchMataPelajaranDetail();
    }
  }, [params.id]);

  const fetchMataPelajaranDetail = async () => {
    setIsLoading(true);
    try {
      const data = await superAdminService.getMataPelajaranById(params.id);
      setMataPelajaran(data);
    } catch (error) {
      showToast.error("Gagal memuat detail mata pelajaran");
      router.push("/super-admin/mata-pelajaran");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await superAdminService.updateMataPelajaran(params.id, data);
      showToast.success("Mata pelajaran berhasil diperbarui");
      setShowFormModal(false);
      fetchMataPelajaranDetail();
    } catch (error) {
      showToast.error(
        error.response?.data?.message || "Gagal memperbarui data"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSuccess = () => {
    showToast.success("Mata pelajaran berhasil dinonaktifkan");
    router.push("/super-admin/mata-pelajaran");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-primary-main animate-spin" />
      </div>
    );
  }

  if (!mataPelajaran) {
    return null;
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          onClick={() => router.push("/super-admin/mata-pelajaran")}
          className="flex items-center gap-2 text-neutral-secondary hover:text-primary-main transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Kembali ke Daftar Mata Pelajaran</span>
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#00a3d4] to-[#005f8b] flex items-center justify-center shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-neutral-text">
                  {mataPelajaran.nama}
                </h1>
                {mataPelajaran.isActive ? (
                  <span className="px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium">
                    Aktif
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-neutral-light/30 text-neutral-secondary text-sm font-medium">
                    Nonaktif
                  </span>
                )}
              </div>
              <p className="text-neutral-secondary">
                Kode:{" "}
                <span className="font-semibold">{mataPelajaran.kode}</span>
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            {mataPelajaran.isActive && (
              <>
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="px-4 py-2 border border-primary-main text-primary-main rounded-lg hover:bg-primary-main/10 transition-colors flex items-center gap-2 font-medium"
                >
                  <UserPlus className="w-5 h-5" />
                  Kelola Guru
                </button>
                <button
                  onClick={() => setShowFormModal(true)}
                  className="px-4 py-2 bg-primary-main text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 font-medium"
                >
                  <Edit className="w-5 h-5" />
                  Edit
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger-dark transition-colors flex items-center gap-2 font-medium"
                >
                  <Trash2 className="w-5 h-5" />
                  Nonaktifkan
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Umum */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card>
            <h2 className="text-xl font-bold text-neutral-text mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary-main" />
              Informasi Mata Pelajaran
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-neutral-secondary font-medium">
                  Nama Mata Pelajaran
                </label>
                <p className="text-neutral-text font-semibold mt-1">
                  {mataPelajaran.nama}
                </p>
              </div>
              <div>
                <label className="text-sm text-neutral-secondary font-medium">
                  Kode
                </label>
                <p className="text-neutral-text font-semibold mt-1">
                  {mataPelajaran.kode}
                </p>
              </div>
              <div>
                <label className="text-sm text-neutral-secondary font-medium">
                  Deskripsi
                </label>
                <p className="text-neutral-text mt-1">
                  {mataPelajaran.deskripsi || "Tidak ada deskripsi"}
                </p>
              </div>
              <div className="pt-4 border-t border-neutral-border">
                <div className="flex items-center gap-2 text-sm text-neutral-secondary">
                  <User className="w-4 h-4" />
                  <span>
                    Dibuat oleh: {mataPelajaran.createdBy?.name || "Sistem"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-secondary mt-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Dibuat:{" "}
                    {new Date(mataPelajaran.createdAt).toLocaleDateString(
                      "id-ID",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <h2 className="text-xl font-bold text-neutral-text mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-main" />
              Statistik
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-primary-main/10 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-secondary font-medium">
                    Total Guru
                  </span>
                  <span className="text-2xl font-bold text-primary-main">
                    {mataPelajaran.guru?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Daftar Guru */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3"
        >
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-neutral-text flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-main" />
                Guru Pengampu
              </h2>
              {mataPelajaran.isActive && (
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="text-sm text-primary-main hover:text-primary-dark font-medium flex items-center gap-1"
                >
                  <UserPlus className="w-4 h-4" />
                  Kelola Guru
                </button>
              )}
            </div>

            {mataPelajaran.guru && mataPelajaran.guru.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mataPelajaran.guru.map((guru, index) => (
                  <motion.div
                    key={guru._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 border border-neutral-border rounded-lg hover:border-primary-main transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-main to-primary-darkest flex items-center justify-center text-white font-bold">
                        {guru.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-neutral-text truncate">
                          {guru.name}
                        </p>
                        <p className="text-sm text-neutral-secondary truncate">
                          NIP: {guru.identifier}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-neutral-border rounded-lg">
                <Users className="w-12 h-12 text-neutral-secondary mx-auto mb-3" />
                <p className="text-neutral-secondary">
                  Belum ada guru yang ditugaskan
                </p>
                {mataPelajaran.isActive && (
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="mt-4 px-4 py-2 bg-primary-main text-white rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    Tugaskan Guru
                  </button>
                )}
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Modals */}
      <MataPelajaranFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSubmit={handleFormSubmit}
        initialData={mataPelajaran}
        isLoading={isSubmitting}
      />

      <AssignGuruModal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          fetchMataPelajaranDetail();
        }}
        mataPelajaran={mataPelajaran}
      />

      <DeleteMataPelajaranModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        mataPelajaran={mataPelajaran}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
