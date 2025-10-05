// src/components/guru/DeleteTugasModal.jsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Loader2, AlertTriangle, Trash2 } from "lucide-react";

const DeleteTugasModal = ({ tugas, onClose, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(tugas._id);
    } catch (error) {
      console.error("Error deleting tugas:", error);
    } finally {
      setIsDeleting(false);
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
        className="bg-background-card rounded-2xl shadow-2xl max-w-md w-full"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-danger" />
            </div>
            <h2 className="text-xl font-bold text-neutral-text">Hapus Tugas</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-2 hover:bg-neutral-light/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-neutral-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-danger/5 border border-danger/20 rounded-xl p-4 mb-6">
            <p className="text-neutral-text mb-2">
              Anda yakin ingin menghapus tugas ini?
            </p>
            <p className="text-sm text-neutral-secondary mb-3">
              <span className="font-semibold text-neutral-text">
                "{tugas.judul}"
              </span>
            </p>
            <div className="flex items-start gap-2 text-sm text-danger">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium mb-1">Tindakan ini akan:</p>
                <ul className="list-disc list-inside space-y-1 text-danger/80">
                  <li>Menghapus semua file pengumpulan siswa</li>
                  <li>Menghapus semua nilai terkait tugas ini</li>
                  <li>Tidak dapat dibatalkan</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-6 py-3 bg-neutral-light/10 hover:bg-neutral-light/20 text-neutral-text rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 px-6 py-3 bg-danger hover:bg-danger/90 text-white rounded-xl font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Menghapus...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  <span>Hapus Tugas</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DeleteTugasModal;
