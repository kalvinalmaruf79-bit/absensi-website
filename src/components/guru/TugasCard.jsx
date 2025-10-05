// src/components/guru/TugasCard.jsx
"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  BookOpen,
  Eye,
  Edit2,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const TugasCard = ({ tugas, index, onViewSubmissions, onEdit, onDelete }) => {
  const isExpired = new Date(tugas.deadline) < new Date();

  const totalSubmissions = tugas.submissions?.length || 0;
  const gradedSubmissions =
    tugas.submissions?.filter(
      (sub) => sub.nilai !== undefined && sub.nilai !== null
    ).length || 0;
  const ungradedSubmissions = totalSubmissions - gradedSubmissions;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-neutral-light/5 hover:bg-neutral-light/10 border border-neutral-border rounded-xl p-5 transition-all hover:shadow-lg group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-neutral-text mb-2 group-hover:text-primary transition-colors">
            {tugas.judul}
          </h3>
          <p className="text-sm text-neutral-secondary line-clamp-2">
            {tugas.deskripsi}
          </p>
        </div>

        {/* Status Badge */}
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            isExpired
              ? "bg-danger/10 text-danger"
              : "bg-success/10 text-success"
          }`}
        >
          {isExpired ? "Selesai" : "Aktif"}
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Kelas */}
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-neutral-tertiary" />
          <span className="text-neutral-secondary">
            {tugas.kelas?.nama || "N/A"}
          </span>
        </div>

        {/* Mata Pelajaran */}
        <div className="flex items-center gap-2 text-sm">
          <BookOpen className="w-4 h-4 text-neutral-tertiary" />
          <span className="text-neutral-secondary">
            {tugas.mataPelajaran?.nama || "N/A"}
          </span>
        </div>

        {/* Deadline */}
        <div className="flex items-center gap-2 text-sm col-span-2">
          <Calendar className="w-4 h-4 text-neutral-tertiary" />
          <span className="text-neutral-secondary">
            {format(new Date(tugas.deadline), "dd MMMM yyyy, HH:mm", {
              locale: id,
            })}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {/* Total Submissions */}
        <div className="bg-primary/10 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Users className="w-3 h-3 text-primary" />
          </div>
          <p className="text-xs text-neutral-secondary">Total</p>
          <p className="text-lg font-bold text-primary">{totalSubmissions}</p>
        </div>

        {/* Graded */}
        <div className="bg-success/10 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <CheckCircle2 className="w-3 h-3 text-success" />
          </div>
          <p className="text-xs text-neutral-secondary">Dinilai</p>
          <p className="text-lg font-bold text-success">{gradedSubmissions}</p>
        </div>

        {/* Ungraded */}
        <div className="bg-warning/10 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Clock className="w-3 h-3 text-warning" />
          </div>
          <p className="text-xs text-neutral-secondary">Pending</p>
          <p className="text-lg font-bold text-warning">
            {ungradedSubmissions}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onViewSubmissions(tugas._id)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-medium transition-all"
        >
          <Eye className="w-4 h-4" />
          <span>Lihat</span>
        </button>

        <button
          onClick={() => onEdit(tugas)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-info/10 hover:bg-info/20 text-info rounded-lg font-medium transition-all"
        >
          <Edit2 className="w-4 h-4" />
        </button>

        <button
          onClick={() => onDelete(tugas)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-danger/10 hover:bg-danger/20 text-danger rounded-lg font-medium transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default TugasCard;
