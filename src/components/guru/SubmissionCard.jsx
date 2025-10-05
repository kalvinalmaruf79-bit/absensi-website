// src/components/guru/SubmissionCard.jsx
"use client";

import { motion } from "framer-motion";
import {
  Download,
  Award,
  MessageSquare,
  CheckCircle2,
  Clock,
  FileText,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const SubmissionCard = ({ submission, index, onGradeClick }) => {
  const isGraded = submission.nilai !== undefined && submission.nilai !== null;

  const getScoreColor = (score) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-danger";
  };

  const getScoreBg = (score) => {
    if (score >= 80) return "bg-success/10";
    if (score >= 60) return "bg-warning/10";
    return "bg-danger/10";
  };

  const handleDownload = () => {
    if (submission.url) {
      window.open(submission.url, "_blank");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-5 bg-neutral-light/5 hover:bg-neutral-light/10 rounded-xl transition-all border border-neutral-border/50"
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        {/* Siswa Info */}
        <div className="flex items-center gap-4 flex-1 min-w-[200px]">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-darkest flex items-center justify-center text-white font-semibold shadow-md">
            {submission.siswa?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-neutral-text">
              {submission.siswa?.name}
            </h3>
            <p className="text-sm text-neutral-secondary">
              NIS: {submission.siswa?.identifier}
            </p>
            {submission.submittedAt && (
              <p className="text-xs text-neutral-tertiary mt-1">
                Dikumpulkan:{" "}
                {format(
                  new Date(submission.submittedAt),
                  "dd MMM yyyy, HH:mm",
                  {
                    locale: id,
                  }
                )}
              </p>
            )}
          </div>
        </div>

        {/* File Info & Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* File Name */}
          {submission.fileName && (
            <div className="flex items-center gap-2 px-3 py-2 bg-neutral-light/10 rounded-lg">
              <FileText className="w-4 h-4 text-neutral-secondary" />
              <span className="text-sm text-neutral-secondary truncate max-w-[150px]">
                {submission.fileName}
              </span>
            </div>
          )}

          {/* Download Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            className="p-2.5 bg-info/10 hover:bg-info/20 text-info rounded-lg transition-colors"
            title="Download/Lihat File"
          >
            <ExternalLink className="w-5 h-5" />
          </motion.button>

          {/* Status/Score */}
          {isGraded ? (
            <div
              className={`px-4 py-2 rounded-lg ${getScoreBg(
                submission.nilai
              )} flex items-center gap-2`}
            >
              <Award className={`w-5 h-5 ${getScoreColor(submission.nilai)}`} />
              <span className={`font-bold ${getScoreColor(submission.nilai)}`}>
                {submission.nilai}
              </span>
            </div>
          ) : (
            <div className="px-4 py-2 bg-warning/10 text-warning rounded-lg flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="font-medium text-sm">Belum Dinilai</span>
            </div>
          )}

          {/* Grade Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onGradeClick(submission)}
            className={`px-4 py-2.5 rounded-lg font-medium transition-all ${
              isGraded
                ? "bg-neutral-light/10 hover:bg-neutral-light/20 text-neutral-text"
                : "bg-gradient-to-r from-primary to-primary-dark text-white hover:shadow-lg"
            }`}
          >
            {isGraded ? "Edit Nilai" : "Beri Nilai"}
          </motion.button>
        </div>
      </div>

      {/* Feedback */}
      {isGraded && submission.feedback && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 pt-4 border-t border-neutral-border/30"
        >
          <div className="flex items-start gap-2">
            <MessageSquare className="w-4 h-4 text-neutral-secondary mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-neutral-secondary mb-1">Feedback:</p>
              <p className="text-sm text-neutral-text">{submission.feedback}</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SubmissionCard;
