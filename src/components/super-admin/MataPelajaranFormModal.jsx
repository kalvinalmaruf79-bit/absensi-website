// src/components/super-admin/MataPelajaranFormModal.jsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, BookOpen } from "lucide-react";

export default function MataPelajaranFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
}) {
  const [formData, setFormData] = useState({
    nama: "",
    kode: "",
    deskripsi: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        nama: initialData.nama || "",
        kode: initialData.kode || "",
        deskripsi: initialData.deskripsi || "",
      });
    } else {
      setFormData({
        nama: "",
        kode: "",
        deskripsi: "",
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nama.trim()) {
      newErrors.nama = "Nama mata pelajaran wajib diisi";
    }

    if (!formData.kode.trim()) {
      newErrors.kode = "Kode mata pelajaran wajib diisi";
    } else if (formData.kode.length > 10) {
      newErrors.kode = "Kode maksimal 10 karakter";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      await onSubmit({
        ...formData,
        kode: formData.kode.toUpperCase(),
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-neutral-border px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-main to-primary-darkest flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-text">
                  {initialData ? "Edit" : "Tambah"} Mata Pelajaran
                </h2>
                <p className="text-sm text-neutral-secondary">
                  Lengkapi informasi mata pelajaran
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-neutral-surface transition-colors"
            >
              <X className="w-5 h-5 text-neutral-secondary" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Nama Mata Pelajaran */}
            <div>
              <label className="block text-sm font-semibold text-neutral-text mb-2">
                Nama Mata Pelajaran <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                placeholder="Contoh: Matematika Lanjutan"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.nama
                    ? "border-danger focus:ring-danger/20"
                    : "border-neutral-border focus:ring-primary-main/20"
                }`}
              />
              {errors.nama && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-danger"
                >
                  {errors.nama}
                </motion.p>
              )}
            </div>

            {/* Kode Mata Pelajaran */}
            <div>
              <label className="block text-sm font-semibold text-neutral-text mb-2">
                Kode Mata Pelajaran <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="kode"
                value={formData.kode}
                onChange={handleChange}
                placeholder="Contoh: MTK-L"
                maxLength={10}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all uppercase ${
                  errors.kode
                    ? "border-danger focus:ring-danger/20"
                    : "border-neutral-border focus:ring-primary-main/20"
                }`}
              />
              {errors.kode && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-danger"
                >
                  {errors.kode}
                </motion.p>
              )}
              <p className="mt-1 text-xs text-neutral-secondary">
                Maksimal 10 karakter, akan otomatis diubah ke huruf besar
              </p>
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-sm font-semibold text-neutral-text mb-2">
                Deskripsi
              </label>
              <textarea
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleChange}
                placeholder="Deskripsi singkat tentang mata pelajaran (opsional)"
                rows={4}
                className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main/20 transition-all resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 border border-neutral-border text-neutral-text rounded-lg hover:bg-neutral-surface transition-colors font-medium disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-gradient-to-br from-primary-main to-primary-darkest text-white rounded-lg hover:opacity-90 transition-opacity font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {initialData ? "Update" : "Simpan"}
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
