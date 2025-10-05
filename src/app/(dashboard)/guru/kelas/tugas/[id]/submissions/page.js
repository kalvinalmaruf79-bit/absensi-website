// src/app/(dashboard)/guru/kelas/tugas/[id]/submissions/page.js
"use client";

import { useState, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Calendar,
  BookOpen,
  Search,
  Loader2,
  AlertCircle,
  Award,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Card from "@/components/ui/Card";
import { tugasService } from "@/services/tugas.service";
import { showToast } from "@/lib/toast";
import SubmissionCard from "@/components/guru/SubmissionCard";
import GradeSubmissionModal from "@/components/guru/GradeSubmissionModal";

export default function TugasSubmissionsPage({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all"); // all, graded, ungraded
  const [tugasInfo, setTugasInfo] = useState(null);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Stats
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    graded: 0,
    ungraded: 0,
    averageScore: 0,
  });

  useEffect(() => {
    if (resolvedParams.id) {
      fetchSubmissions();
    }
  }, [resolvedParams.id]);

  useEffect(() => {
    filterSubmissions();
  }, [submissions, searchQuery, selectedFilter]);

  const fetchSubmissions = async () => {
    try {
      setIsLoading(true);
      const response = await tugasService.getTugasSubmissions(
        resolvedParams.id
      );

      console.log("Submissions response:", response);

      if (Array.isArray(response)) {
        setSubmissions(response);
        calculateStats(response);
      } else {
        showToast.error("Format data tidak valid");
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
      showToast.error("Gagal memuat data pengumpulan tugas.");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (submissionsList) => {
    const graded = submissionsList.filter(
      (sub) => sub.nilai !== undefined && sub.nilai !== null
    );
    const ungraded = submissionsList.filter(
      (sub) => sub.nilai === undefined || sub.nilai === null
    );

    const totalScore = graded.reduce((acc, sub) => acc + sub.nilai, 0);
    const averageScore = graded.length > 0 ? totalScore / graded.length : 0;

    setStats({
      totalSubmissions: submissionsList.length,
      graded: graded.length,
      ungraded: ungraded.length,
      averageScore: Math.round(averageScore * 10) / 10,
    });
  };

  const filterSubmissions = () => {
    let filtered = [...submissions];

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (sub) =>
          sub.siswa?.name.toLowerCase().includes(query) ||
          sub.siswa?.identifier.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (selectedFilter === "graded") {
      filtered = filtered.filter(
        (sub) => sub.nilai !== undefined && sub.nilai !== null
      );
    } else if (selectedFilter === "ungraded") {
      filtered = filtered.filter(
        (sub) => sub.nilai === undefined || sub.nilai === null
      );
    }

    setFilteredSubmissions(filtered);
  };

  const handleGradeClick = (submission) => {
    setSelectedSubmission(submission);
    setShowGradeModal(true);
  };

  const handleGradeSubmit = async (submissionId, data) => {
    try {
      await tugasService.gradeSubmission(submissionId, data);
      showToast.success("Nilai berhasil disimpan!");
      setShowGradeModal(false);
      setSelectedSubmission(null);
      fetchSubmissions(); // Refresh data
    } catch (error) {
      console.error("Error grading submission:", error);
      showToast.error(
        error.response?.data?.message || "Gagal menyimpan nilai."
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
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
          onClick={() => router.back()}
          className="flex items-center gap-2 text-neutral-secondary hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali ke Daftar Tugas</span>
        </button>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-text mb-2">
              Pengumpulan Tugas
            </h1>
            <p className="text-neutral-secondary">
              Monitor dan nilai pengumpulan tugas siswa
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <Card className="hover:shadow-hover transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-neutral-secondary mb-1">
                Total Pengumpulan
              </p>
              <p className="text-3xl font-bold text-neutral-text">
                {stats.totalSubmissions}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-darkest flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-hover transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-neutral-secondary mb-1">
                Sudah Dinilai
              </p>
              <p className="text-3xl font-bold text-success">{stats.graded}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success to-success-dark flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-hover transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-neutral-secondary mb-1">
                Belum Dinilai
              </p>
              <p className="text-3xl font-bold text-warning">
                {stats.ungraded}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warning to-warning-dark flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-hover transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-neutral-secondary mb-1">
                Rata-rata Nilai
              </p>
              <p className="text-3xl font-bold text-info">
                {stats.averageScore}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-info to-info-dark flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Search & Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6 space-y-4"
      >
        {/* Search Bar */}
        <Card>
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-neutral-tertiary" />
            <input
              type="text"
              placeholder="Cari siswa berdasarkan nama atau NIS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-neutral-text placeholder:text-neutral-tertiary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-sm text-primary hover:text-primary-dark"
              >
                Clear
              </button>
            )}
          </div>
        </Card>

        {/* Filter Tabs */}
        <Card>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedFilter === "all"
                  ? "bg-primary text-white"
                  : "bg-neutral-light/10 text-neutral-secondary hover:bg-neutral-light/20"
              }`}
            >
              Semua ({stats.totalSubmissions})
            </button>
            <button
              onClick={() => setSelectedFilter("ungraded")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedFilter === "ungraded"
                  ? "bg-warning text-white"
                  : "bg-neutral-light/10 text-neutral-secondary hover:bg-neutral-light/20"
              }`}
            >
              Belum Dinilai ({stats.ungraded})
            </button>
            <button
              onClick={() => setSelectedFilter("graded")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedFilter === "graded"
                  ? "bg-success text-white"
                  : "bg-neutral-light/10 text-neutral-secondary hover:bg-neutral-light/20"
              }`}
            >
              Sudah Dinilai ({stats.graded})
            </button>
          </div>
        </Card>
      </motion.div>

      {/* Submissions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-neutral-text">
              Daftar Pengumpulan
            </h2>
            {filteredSubmissions.length > 0 && (
              <span className="text-sm text-neutral-secondary">
                Menampilkan {filteredSubmissions.length} dari{" "}
                {stats.totalSubmissions} pengumpulan
              </span>
            )}
          </div>

          {filteredSubmissions.length > 0 ? (
            <div className="space-y-4">
              {filteredSubmissions.map((submission, index) => (
                <SubmissionCard
                  key={submission._id}
                  submission={submission}
                  index={index}
                  onGradeClick={handleGradeClick}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-neutral-light" />
              <p className="text-neutral-secondary mb-2">
                {searchQuery || selectedFilter !== "all"
                  ? "Tidak ada pengumpulan yang sesuai dengan filter"
                  : "Belum ada siswa yang mengumpulkan tugas"}
              </p>
              {(searchQuery || selectedFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedFilter("all");
                  }}
                  className="text-sm text-primary hover:text-primary-dark"
                >
                  Reset filter
                </button>
              )}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Grade Modal */}
      <AnimatePresence>
        {showGradeModal && selectedSubmission && (
          <GradeSubmissionModal
            submission={selectedSubmission}
            onClose={() => {
              setShowGradeModal(false);
              setSelectedSubmission(null);
            }}
            onSubmit={handleGradeSubmit}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
