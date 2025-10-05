// src/components/guru/GradeSubmissionModal.jsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Loader2, Award, MessageSquare, User, FileText } from "lucide-react";

const GradeSubmissionModal = ({ submission, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    nilai: "",
    feedback: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Pre-fill jika sudah ada nilai
    if (submission.nilai !== undefined && submission.nilai !== null) {
      setFormData({
        nilai: submission.nilai.toString(),
        feedback: submission.feedback || "",
      });
    }
  }, [submission]);

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

    if (!formData.nilai.trim()) {
      newErrors.nilai = "Nilai wajib diisi";
    } else {
      const nilaiNum = parseFloat(formData.nilai);
      if (isNaN(nilaiNum)) {
        newErrors.nilai = "Nilai harus berupa angka";
      } else if (nilaiNum < 0 || nilaiNum > 100) {
        newErrors.nilai = "Nilai harus antara 0-100";
      }
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
      await onSubmit(submission._id, {
        nilai: parseFloat(formData.nilai),
        feedback: formData.feedback.trim() || undefined,
      });
    } catch (error) {
      console.error("Error submitting grade:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-danger";
  };

  const getScoreBg = (score) => {
    if (score >= 80) return "bg-success/10 border-success";
    if (score >= 60) return "bg-warning/10 border-warning";
    return "bg-danger/10 border-danger";
  };

  const currentScore = formData.nilai ? parseFloat(formData.nilai) : null;

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
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-text">
                Beri Nilai Tugas
              </h2>
              <p className="text-sm text-neutral-secondary">
                Berikan penilaian untuk pengumpulan siswa
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

        {/* Content */}
        <div className="p-6">
          {/* Siswa Info */}
          <div className="mb-6 p-4 bg-neutral-light/5 rounded-xl border border-neutral-border/50">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-darkest flex items-center justify-center text-white font-semibold shadow-md">
                {submission.siswa?.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-neutral-secondary" />
                  <h3 className="font-semibold text-neutral-text">
                    {submission.siswa?.name}
                  </h3>
                </div>
                <p className="text-sm text-neutral-secondary">
                  NIS: {submission.siswa?.identifier}
                </p>
              </div>
            </div>

            {submission.fileName && (
              <div className="flex items-center gap-2 text-sm text-neutral-secondary">
                <FileText className="w-4 h-4" />
                <span>File: {submission.fileName}</span>
                <a
                  href={submission.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-primary hover:text-primary-dark underline"
                >
                  Lihat File
                </a>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nilai */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-text mb-2">
                <Award className="w-4 h-4" />
                Nilai <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="nilai"
                  value={formData.nilai}
                  onChange={handleChange}
                  placeholder="Masukkan nilai (0-100)"
                  min="0"
                  max="100"
                  step="0.1"
                  className={`w-full px-4 py-3 bg-neutral-light/10 border ${
                    errors.nilai ? "border-danger" : "border-neutral-border"
                  } rounded-xl outline-none focus:border-primary transition-colors text-lg font-semibold`}
                />
                {currentScore !== null && !isNaN(currentScore) && (
                  <div
                    className={`absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 rounded-full text-xs font-medium ${getScoreBg(
                      currentScore
                    )} ${getScoreColor(currentScore)} border`}
                  >
                    {currentScore >= 80
                      ? "Excellent"
                      : currentScore >= 60
                      ? "Good"
                      : "Needs Improvement"}
                  </div>
                )}
              </div>
              {errors.nilai && (
                <p className="text-sm text-danger mt-1">{errors.nilai}</p>
              )}
              <p className="text-xs text-neutral-tertiary mt-2">
                Rentang nilai: 0-100
              </p>
            </div>

            {/* Score Range Indicator */}
            {currentScore !== null && !isNaN(currentScore) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-neutral-light/5 rounded-xl border border-neutral-border/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-secondary">
                    Kategori Nilai:
                  </span>
                  <span
                    className={`text-sm font-semibold ${getScoreColor(
                      currentScore
                    )}`}
                  >
                    {currentScore >= 80
                      ? "A (Sangat Baik)"
                      : currentScore >= 70
                      ? "B (Baik)"
                      : currentScore >= 60
                      ? "C (Cukup)"
                      : currentScore >= 50
                      ? "D (Kurang)"
                      : "E (Sangat Kurang)"}
                  </span>
                </div>
                <div className="w-full h-2 bg-neutral-light/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${currentScore}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-full rounded-full ${
                      currentScore >= 80
                        ? "bg-success"
                        : currentScore >= 60
                        ? "bg-warning"
                        : "bg-danger"
                    }`}
                  />
                </div>
              </motion.div>
            )}

            {/* Feedback */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-text mb-2">
                <MessageSquare className="w-4 h-4" />
                Feedback (Opsional)
              </label>
              <textarea
                name="feedback"
                value={formData.feedback}
                onChange={handleChange}
                placeholder="Berikan catatan atau komentar untuk siswa..."
                rows="4"
                className="w-full px-4 py-3 bg-neutral-light/10 border border-neutral-border rounded-xl outline-none focus:border-primary transition-colors resize-none"
              />
              <p className="text-xs text-neutral-tertiary mt-2">
                Berikan feedback konstruktif untuk membantu siswa berkembang
              </p>
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
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Award className="w-5 h-5" />
                    <span>Simpan Nilai</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GradeSubmissionModal;
