// src/components/guru/CreateTugasModal.jsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Loader2, FileText, Calendar, BookOpen, Users } from "lucide-react";

const CreateTugasModal = ({
  onClose,
  onCreate,
  kelasList,
  mataPelajaranList,
}) => {
  const [formData, setFormData] = useState({
    judul: "",
    deskripsi: "",
    mataPelajaran: "",
    kelas: "",
    deadline: "",
    semester: "ganjil",
    tahunAjaran: "2024/2025",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error saat user mulai mengetik
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.judul.trim()) {
      newErrors.judul = "Judul tugas wajib diisi";
    }
    if (!formData.deskripsi.trim()) {
      newErrors.deskripsi = "Deskripsi tugas wajib diisi";
    }
    if (!formData.mataPelajaran) {
      newErrors.mataPelajaran = "Mata pelajaran wajib dipilih";
    }
    if (!formData.kelas) {
      newErrors.kelas = "Kelas wajib dipilih";
    }
    if (!formData.deadline) {
      newErrors.deadline = "Deadline wajib diisi";
    } else {
      const deadlineDate = new Date(formData.deadline);
      const now = new Date();
      if (deadlineDate <= now) {
        newErrors.deadline = "Deadline harus di masa depan";
      }
    }
    if (!formData.semester) {
      newErrors.semester = "Semester wajib dipilih";
    }
    if (!formData.tahunAjaran.trim()) {
      newErrors.tahunAjaran = "Tahun ajaran wajib diisi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreate(formData);
    } catch (error) {
      console.error("Error creating tugas:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-background-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-background-card border-b border-neutral-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-darkest flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-text">
                Buat Tugas Baru
              </h2>
              <p className="text-sm text-neutral-secondary">
                Isi form di bawah untuk membuat tugas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-light/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-neutral-secondary" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Judul */}
          <div>
            <label className="block text-sm font-medium text-neutral-text mb-2">
              Judul Tugas <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="judul"
              value={formData.judul}
              onChange={handleChange}
              placeholder="Masukkan judul tugas..."
              className={`w-full px-4 py-3 bg-neutral-light/10 border ${
                errors.judul ? "border-danger" : "border-neutral-border"
              } rounded-xl outline-none focus:border-primary transition-colors`}
            />
            {errors.judul && (
              <p className="text-sm text-danger mt-1">{errors.judul}</p>
            )}
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-medium text-neutral-text mb-2">
              Deskripsi <span className="text-danger">*</span>
            </label>
            <textarea
              name="deskripsi"
              value={formData.deskripsi}
              onChange={handleChange}
              placeholder="Jelaskan detail tugas..."
              rows="4"
              className={`w-full px-4 py-3 bg-neutral-light/10 border ${
                errors.deskripsi ? "border-danger" : "border-neutral-border"
              } rounded-xl outline-none focus:border-primary transition-colors resize-none`}
            />
            {errors.deskripsi && (
              <p className="text-sm text-danger mt-1">{errors.deskripsi}</p>
            )}
          </div>

          {/* Kelas & Mata Pelajaran */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Kelas */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-text mb-2">
                <Users className="w-4 h-4" />
                Kelas <span className="text-danger">*</span>
              </label>
              <select
                name="kelas"
                value={formData.kelas}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-neutral-light/10 border ${
                  errors.kelas ? "border-danger" : "border-neutral-border"
                } rounded-xl outline-none focus:border-primary transition-colors`}
              >
                <option value="">Pilih Kelas</option>
                {kelasList.map((kelas) => (
                  <option key={kelas._id} value={kelas._id}>
                    {kelas.nama}
                  </option>
                ))}
              </select>
              {errors.kelas && (
                <p className="text-sm text-danger mt-1">{errors.kelas}</p>
              )}
            </div>

            {/* Mata Pelajaran */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-text mb-2">
                <BookOpen className="w-4 h-4" />
                Mata Pelajaran <span className="text-danger">*</span>
              </label>
              <select
                name="mataPelajaran"
                value={formData.mataPelajaran}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-neutral-light/10 border ${
                  errors.mataPelajaran
                    ? "border-danger"
                    : "border-neutral-border"
                } rounded-xl outline-none focus:border-primary transition-colors`}
              >
                <option value="">Pilih Mata Pelajaran</option>
                {mataPelajaranList.map((mapel) => (
                  <option key={mapel._id} value={mapel._id}>
                    {mapel.nama}
                  </option>
                ))}
              </select>
              {errors.mataPelajaran && (
                <p className="text-sm text-danger mt-1">
                  {errors.mataPelajaran}
                </p>
              )}
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-text mb-2">
              <Calendar className="w-4 h-4" />
              Deadline <span className="text-danger">*</span>
            </label>
            <input
              type="datetime-local"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-neutral-light/10 border ${
                errors.deadline ? "border-danger" : "border-neutral-border"
              } rounded-xl outline-none focus:border-primary transition-colors`}
            />
            {errors.deadline && (
              <p className="text-sm text-danger mt-1">{errors.deadline}</p>
            )}
          </div>

          {/* Semester & Tahun Ajaran */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Semester */}
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Semester <span className="text-danger">*</span>
              </label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-neutral-light/10 border ${
                  errors.semester ? "border-danger" : "border-neutral-border"
                } rounded-xl outline-none focus:border-primary transition-colors`}
              >
                <option value="ganjil">Ganjil</option>
                <option value="genap">Genap</option>
              </select>
              {errors.semester && (
                <p className="text-sm text-danger mt-1">{errors.semester}</p>
              )}
            </div>

            {/* Tahun Ajaran */}
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Tahun Ajaran <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="tahunAjaran"
                value={formData.tahunAjaran}
                onChange={handleChange}
                placeholder="2024/2025"
                className={`w-full px-4 py-3 bg-neutral-light/10 border ${
                  errors.tahunAjaran ? "border-danger" : "border-neutral-border"
                } rounded-xl outline-none focus:border-primary transition-colors`}
              />
              {errors.tahunAjaran && (
                <p className="text-sm text-danger mt-1">{errors.tahunAjaran}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-neutral-light/10 hover:bg-neutral-light/20 text-neutral-text rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-primary-darkest text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Membuat...</span>
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  <span>Buat Tugas</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CreateTugasModal;
