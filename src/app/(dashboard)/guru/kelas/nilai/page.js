// src/app/(dashboard)/guru/kelas/nilai/page.js
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Users,
  TrendingUp,
  Download,
  Plus,
  Filter,
  Search,
  Loader2,
  FileText,
  GraduationCap,
  ChevronDown,
  X,
  Save,
  AlertCircle,
  Edit2,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import { guruService } from "@/services/guru.service";
import { showToast } from "@/lib/toast";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

const studentItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (index) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: index * 0.05,
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};
// Komponen Modal untuk Input Nilai Single
const SingleInputModal = ({
  show,
  onClose,
  siswa,
  selectedJenis,
  semester,
  tahunAjaran,
  onSubmit,
}) => {
  const [nilai, setNilai] = useState("");
  const [deskripsi, setDeskripsi] = useState("");

  useEffect(() => {
    if (show) {
      setNilai("");
      setDeskripsi("");
    }
  }, [show]);

  const handleSubmit = () => {
    if (!nilai || isNaN(parseFloat(nilai))) {
      showToast.error("Nilai harus diisi dengan angka");
      return;
    }

    if (parseFloat(nilai) < 0 || parseFloat(nilai) > 100) {
      showToast.error("Nilai harus antara 0-100");
      return;
    }

    onSubmit({
      siswaId: siswa._id,
      nilai: parseFloat(nilai),
      deskripsi,
    });
  };

  const jenisPenilaianOptions = [
    { value: "tugas", label: "Tugas" },
    { value: "harian", label: "Harian" },
    { value: "uts", label: "UTS" },
    { value: "uas", label: "UAS" },
    { value: "praktik", label: "Praktik" },
  ];

  const jenisLabel =
    jenisPenilaianOptions.find((j) => j.value === selectedJenis)?.label ||
    selectedJenis;

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-neutral-border flex items-center justify-between bg-gradient-to-r from-primary/5 to-primary/10">
            <div>
              <h3 className="text-xl font-bold text-neutral-text">
                Input Nilai Siswa
              </h3>
              <p className="text-sm text-neutral-secondary mt-1">
                {jenisLabel} • {semester} • {tahunAjaran}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-neutral-light/20 hover:bg-neutral-light/30 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-neutral-secondary" />
            </motion.button>
          </div>

          {/* Modal Body */}
          <div className="px-6 py-6 space-y-4">
            {/* Info Siswa */}
            <div className="p-4 bg-neutral-light/10 rounded-lg">
              <p className="font-medium text-neutral-text">{siswa.name}</p>
              <p className="text-sm text-neutral-secondary">
                NIS: {siswa.identifier}
              </p>
            </div>

            {/* Input Nilai */}
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Nilai <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="Masukkan nilai (0-100)"
                value={nilai}
                onChange={(e) => setNilai(e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                autoFocus
              />
            </div>

            {/* Input Deskripsi */}
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Deskripsi (Opsional)
              </label>
              <textarea
                placeholder="Catatan tambahan..."
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-neutral-border flex items-center justify-end gap-3 bg-neutral-light/5">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="px-6 py-2.5 bg-neutral-light/20 text-neutral-text rounded-lg font-medium hover:bg-neutral-light/30 transition-colors"
            >
              Batal
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
            >
              <Save className="w-4 h-4" />
              Simpan
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
// Komponen Modal untuk Input Nilai Massal
const BulkInputModal = ({
  show,
  onClose,
  siswaList,
  selectedJenis,
  semester,
  tahunAjaran,
  onSubmit,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [bulkNilai, setBulkNilai] = useState({});

  useEffect(() => {
    if (show && siswaList.length > 0) {
      const initialBulk = {};
      siswaList.forEach((siswa) => {
        initialBulk[siswa._id] = { nilai: "", deskripsi: "" };
      });
      setBulkNilai(initialBulk);
    }
  }, [show, siswaList]);

  const handleChange = (siswaId, field, value) => {
    setBulkNilai((prev) => ({
      ...prev,
      [siswaId]: {
        ...prev[siswaId],
        [field]: value,
      },
    }));
  };

  const handleSubmit = () => {
    const nilaiSiswa = Object.entries(bulkNilai)
      .filter(
        ([_, data]) => data.nilai !== "" && !isNaN(parseFloat(data.nilai))
      )
      .map(([siswaId, data]) => ({
        siswaId,
        nilai: parseFloat(data.nilai),
        deskripsi: data.deskripsi,
      }));

    if (nilaiSiswa.length === 0) {
      showToast.error("Tidak ada nilai yang diinput");
      return;
    }

    onSubmit(nilaiSiswa);
  };

  const filteredSiswa = siswaList.filter(
    (siswa) =>
      siswa.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      siswa.identifier.includes(searchTerm)
  );

  const jenisPenilaianOptions = [
    { value: "tugas", label: "Tugas" },
    { value: "harian", label: "Harian" },
    { value: "uts", label: "UTS" },
    { value: "uas", label: "UAS" },
    { value: "praktik", label: "Praktik" },
  ];

  const jenisLabel =
    jenisPenilaianOptions.find((j) => j.value === selectedJenis)?.label ||
    selectedJenis;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-neutral-border flex items-center justify-between bg-gradient-to-r from-primary/5 to-primary/10">
              <div>
                <h3 className="text-xl font-bold text-neutral-text">
                  Input Nilai Massal
                </h3>
                <p className="text-sm text-neutral-secondary mt-1">
                  {jenisLabel} • {semester} • {tahunAjaran}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-neutral-light/20 hover:bg-neutral-light/30 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-neutral-secondary" />
              </motion.button>
            </div>

            {/* Search Bar */}
            <div className="px-6 py-4 border-b border-neutral-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-tertiary" />
                <input
                  type="text"
                  placeholder="Cari siswa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Student List */}
            <div className="overflow-y-auto max-h-[50vh] px-6 py-4">
              <div className="space-y-3">
                {filteredSiswa.map((siswa, index) => (
                  <motion.div
                    key={siswa._id}
                    custom={index}
                    variants={studentItemVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex items-center gap-4 p-4 bg-neutral-light/10 rounded-lg hover:bg-neutral-light/20 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-neutral-text">
                        {siswa.name}
                      </p>
                      <p className="text-sm text-neutral-secondary">
                        NIS: {siswa.identifier}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <motion.input
                        whileFocus={{ scale: 1.02 }}
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Nilai"
                        value={bulkNilai[siswa._id]?.nilai || ""}
                        onChange={(e) =>
                          handleChange(siswa._id, "nilai", e.target.value)
                        }
                        className="w-20 px-3 py-2 border border-neutral-border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                      <motion.input
                        whileFocus={{ scale: 1.02 }}
                        type="text"
                        placeholder="Deskripsi (opsional)"
                        value={bulkNilai[siswa._id]?.deskripsi || ""}
                        onChange={(e) =>
                          handleChange(siswa._id, "deskripsi", e.target.value)
                        }
                        className="w-48 px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-neutral-border flex items-center justify-between bg-neutral-light/5">
              <p className="text-sm text-neutral-secondary">
                {Object.values(bulkNilai).filter((n) => n.nilai !== "").length}{" "}
                dari {filteredSiswa.length} siswa memiliki nilai
              </p>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="px-6 py-2.5 bg-neutral-light/20 text-neutral-text rounded-lg font-medium hover:bg-neutral-light/30 transition-colors"
                >
                  Batal
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Simpan Semua
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Main Component
export default function ManajemenNilaiPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [kelasList, setKelasList] = useState([]);
  const [mapelList, setMapelList] = useState([]);

  const [selectedKelas, setSelectedKelas] = useState("");
  const [selectedMapel, setSelectedMapel] = useState("");
  const [selectedJenis, setSelectedJenis] = useState("");
  const [semester, setSemester] = useState("ganjil");
  const [tahunAjaran, setTahunAjaran] = useState("2024/2025");

  const [showBulkInput, setShowBulkInput] = useState(false);
  const [siswaList, setSiswaList] = useState([]);
  const [nilaiHistory, setNilaiHistory] = useState([]);
  const [editingNilaiId, setEditingNilaiId] = useState(null);
  const [editNilai, setEditNilai] = useState("");
  const [editDeskripsi, setEditDeskripsi] = useState("");
  const [showSingleInput, setShowSingleInput] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState(null);
  const [stats, setStats] = useState({
    totalNilaiTerinput: 0,
    rataRataKelas: 0,
    siswaTuntas: 0,
  });

  const jenisPenilaianOptions = [
    { value: "tugas", label: "Tugas" },
    { value: "harian", label: "Harian" },
    { value: "uts", label: "UTS" },
    { value: "uas", label: "UAS" },
    { value: "praktik", label: "Praktik" },
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedKelas && selectedMapel) {
      fetchSiswaList();
      fetchNilaiHistory();
    }
  }, [selectedKelas, selectedMapel, semester, tahunAjaran, selectedJenis]);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [kelasData, mapelData] = await Promise.all([
        guruService.getKelasDiampu(),
        guruService.getMataPelajaranDiampu(),
      ]);

      setKelasList(kelasData || []);
      setMapelList(mapelData || []);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      showToast.error("Gagal memuat data kelas dan mata pelajaran");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSiswaList = async () => {
    try {
      const response = await guruService.getSiswaKelas(selectedKelas, {
        limit: 100,
      });
      setSiswaList(response.docs || []);
    } catch (error) {
      console.error("Error fetching siswa:", error);
      showToast.error("Gagal memuat data siswa");
    }
  };

  const fetchNilaiHistory = async () => {
    if (!selectedJenis) return;

    try {
      const response = await guruService.getNilaiSiswa({
        kelasId: selectedKelas,
        mataPelajaranId: selectedMapel,
        jenisPenilaian: selectedJenis, // Tambahkan filter jenis
        semester,
        tahunAjaran,
        limit: 50,
      });

      setNilaiHistory(response.docs || []);

      // Calculate stats
      if (response.docs && response.docs.length > 0) {
        const total = response.docs.length;
        const sum = response.docs.reduce((acc, n) => acc + n.nilai, 0);
        const avg = sum / total;
        const tuntas = response.docs.filter((n) => n.nilai >= 75).length;

        setStats({
          totalNilaiTerinput: total,
          rataRataKelas: avg.toFixed(2),
          siswaTuntas: tuntas,
        });
      } else {
        setStats({
          totalNilaiTerinput: 0,
          rataRataKelas: 0,
          siswaTuntas: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching nilai:", error);
    }
  };
  const handleSingleSubmit = async (data) => {
    try {
      await guruService.inputNilai({
        siswaId: data.siswaId,
        kelasId: selectedKelas,
        mataPelajaranId: selectedMapel,
        jenisPenilaian: selectedJenis,
        nilai: data.nilai,
        deskripsi: data.deskripsi,
        semester,
        tahunAjaran,
      });

      showToast.success("Nilai berhasil disimpan!");
      setShowSingleInput(false);
      setSelectedSiswa(null);
      fetchNilaiHistory();
    } catch (error) {
      console.error("Error submitting nilai:", error);
      showToast.error("Gagal menyimpan nilai. Silakan coba lagi.");
    }
  };
  const handleUpdateNilai = async (nilaiId, newNilai, newDeskripsi) => {
    try {
      await guruService.updateNilai(nilaiId, {
        nilai: newNilai,
        deskripsi: newDeskripsi,
      });
      showToast.success("Nilai berhasil diperbarui!");
      fetchNilaiHistory();
    } catch (error) {
      console.error("Error updating nilai:", error);
      showToast.error("Gagal memperbarui nilai");
    }
  };

  const handleDeleteNilai = async (nilaiId) => {
    if (!confirm("Apakah Anda yakin ingin menghapus nilai ini?")) return;

    try {
      await guruService.deleteNilai(nilaiId);
      showToast.success("Nilai berhasil dihapus!");
      fetchNilaiHistory();
    } catch (error) {
      console.error("Error deleting nilai:", error);
      showToast.error("Gagal menghapus nilai");
    }
  };
  const handleBulkSubmit = async (nilaiSiswa) => {
    try {
      await guruService.inputNilaiMassal({
        kelasId: selectedKelas,
        mataPelajaranId: selectedMapel,
        jenisPenilaian: selectedJenis,
        semester,
        tahunAjaran,
        nilaiSiswa,
      });

      showToast.success(`Berhasil menyimpan ${nilaiSiswa.length} nilai!`);
      setShowBulkInput(false);
      fetchNilaiHistory();
    } catch (error) {
      console.error("Error submitting bulk nilai:", error);
      showToast.error("Gagal menyimpan nilai. Silakan coba lagi.");
    }
  };

  const handleExportNilai = async () => {
    if (!selectedKelas || !selectedMapel) {
      showToast.error("Pilih kelas dan mata pelajaran terlebih dahulu");
      return;
    }

    try {
      const blob = await guruService.exportNilai({
        kelasId: selectedKelas,
        mataPelajaranId: selectedMapel,
        semester,
        tahunAjaran,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Nilai-Export-${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast.success("Nilai berhasil diekspor!");
    } catch (error) {
      console.error("Error exporting nilai:", error);
      showToast.error("Gagal mengekspor nilai");
    }
  };

  const canShowBulkInput =
    selectedKelas && selectedMapel && selectedJenis && siswaList.length > 0;

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
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-neutral-text mb-2">
          Manajemen Nilai
        </h1>
        <p className="text-neutral-secondary">
          Input dan kelola nilai siswa untuk setiap mata pelajaran
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-hover transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-secondary mb-1">
                  Total Nilai Terinput
                </p>
                <p className="text-3xl font-bold text-neutral-text">
                  {stats.totalNilaiTerinput}
                </p>
                <p className="text-xs text-neutral-tertiary mt-1">
                  Periode ini
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-darkest flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-hover transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-secondary mb-1">
                  Rata-rata Kelas
                </p>
                <p className="text-3xl font-bold text-neutral-text">
                  {stats.rataRataKelas}
                </p>
                <p className="text-xs text-neutral-tertiary mt-1">
                  Semua mata pelajaran
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success to-success-dark flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-hover transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-secondary mb-1">
                  Siswa Tuntas
                </p>
                <p className="text-3xl font-bold text-neutral-text">
                  {stats.siswaTuntas}
                </p>
                <p className="text-xs text-neutral-tertiary mt-1">
                  Dari total siswa
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-info to-info-dark flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Filter Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: 0.2,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        className="mb-6"
      >
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-neutral-text">
              Filter & Pengaturan
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Kelas */}
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Pilih Kelas
              </label>
              <div className="relative">
                <select
                  value={selectedKelas}
                  onChange={(e) => setSelectedKelas(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-neutral-border rounded-lg text-neutral-text appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="">Pilih Kelas</option>
                  {kelasList.map((kelas) => (
                    <option key={kelas._id} value={kelas._id}>
                      {kelas.nama}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-neutral-tertiary pointer-events-none" />
              </div>
            </div>

            {/* Mata Pelajaran */}
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Mata Pelajaran
              </label>
              <div className="relative">
                <select
                  value={selectedMapel}
                  onChange={(e) => setSelectedMapel(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-neutral-border rounded-lg text-neutral-text appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="">Pilih Mapel</option>
                  {mapelList.map((mapel) => (
                    <option key={mapel._id} value={mapel._id}>
                      {mapel.nama}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-neutral-tertiary pointer-events-none" />
              </div>
            </div>

            {/* Jenis Penilaian */}
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Jenis Penilaian
              </label>
              <div className="relative">
                <select
                  value={selectedJenis}
                  onChange={(e) => setSelectedJenis(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-neutral-border rounded-lg text-neutral-text appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="">Pilih Jenis</option>
                  {jenisPenilaianOptions.map((jenis) => (
                    <option key={jenis.value} value={jenis.value}>
                      {jenis.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-neutral-tertiary pointer-events-none" />
              </div>
            </div>

            {/* Semester */}
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Semester
              </label>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSemester("ganjil")}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    semester === "ganjil"
                      ? "bg-primary text-white shadow-md"
                      : "bg-neutral-light/20 text-neutral-secondary hover:bg-neutral-light/30"
                  }`}
                >
                  Ganjil
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSemester("genap")}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    semester === "genap"
                      ? "bg-primary text-white shadow-md"
                      : "bg-neutral-light/20 text-neutral-secondary hover:bg-neutral-light/30"
                  }`}
                >
                  Genap
                </motion.button>
              </div>
            </div>

            {/* Tahun Ajaran */}
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Tahun Ajaran
              </label>
              <div className="relative">
                <select
                  value={tahunAjaran}
                  onChange={(e) => setTahunAjaran(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-neutral-border rounded-lg text-neutral-text appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="2024/2025">2024/2025</option>
                  <option value="2023/2024">2023/2024</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-neutral-tertiary pointer-events-none" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-end gap-2">
              <motion.button
                whileHover={canShowBulkInput ? { scale: 1.02 } : {}}
                whileTap={canShowBulkInput ? { scale: 0.98 } : {}}
                onClick={() => canShowBulkInput && setShowBulkInput(true)}
                disabled={!canShowBulkInput}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                  canShowBulkInput
                    ? "bg-primary text-white hover:bg-primary-dark shadow-md hover:shadow-lg"
                    : "bg-neutral-light/20 text-neutral-light cursor-not-allowed"
                }`}
              >
                <Plus className="w-4 h-4" />
                Input Nilai
              </motion.button>
              <motion.button
                whileHover={
                  selectedKelas && selectedMapel ? { scale: 1.05 } : {}
                }
                whileTap={selectedKelas && selectedMapel ? { scale: 0.95 } : {}}
                onClick={handleExportNilai}
                disabled={!selectedKelas || !selectedMapel}
                className={`px-4 py-2.5 rounded-lg font-medium transition-all ${
                  selectedKelas && selectedMapel
                    ? "bg-success text-white hover:bg-success-dark shadow-md hover:shadow-lg"
                    : "bg-neutral-light/20 text-neutral-light cursor-not-allowed"
                }`}
              >
                <Download className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {!selectedKelas || !selectedMapel ? (
          <motion.div
            key="empty-kelas"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Card>
              <div className="text-center py-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <GraduationCap className="w-16 h-16 mx-auto mb-4 text-neutral-light" />
                </motion.div>
                <p className="text-neutral-secondary mb-2">
                  Pilih kelas dan mata pelajaran untuk mulai mengelola nilai
                </p>
                <p className="text-sm text-neutral-tertiary">
                  Gunakan filter di atas untuk memilih kelas dan mata pelajaran
                </p>
              </div>
            </Card>
          </motion.div>
        ) : !selectedJenis ? (
          <motion.div
            key="empty-jenis"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Card>
              <div className="text-center py-12">
                <motion.div
                  initial={{
                    scale: 0,
                  }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <AlertCircle className="w-16 h-16 mx-auto mb-4 text-warning" />
                </motion.div>
                <p className="text-neutral-text font-medium mb-2">
                  Pilih Jenis Penilaian
                </p>
                <p className="text-sm text-neutral-secondary">
                  Tentukan jenis penilaian (Tugas, UTS, UAS, dll) untuk
                  melanjutkan
                </p>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="nilai-table"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-neutral-text">
                  Riwayat Nilai
                </h2>
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-sm text-neutral-secondary"
                >
                  {nilaiHistory.length} entri
                </motion.span>
              </div>

              {nilaiHistory.length === 0 ? (
                <div className="text-center py-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  >
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-neutral-light" />
                  </motion.div>
                  <p className="text-neutral-secondary mb-2">
                    Belum ada nilai yang terinput
                  </p>
                  <p className="text-sm text-neutral-tertiary">
                    Klik tombol "Input Nilai" untuk mulai memasukkan nilai
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-border">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-text">
                          Siswa
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-text">
                          NIS
                        </th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-neutral-text">
                          Nilai
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-text">
                          Deskripsi
                        </th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-neutral-text">
                          Status
                        </th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-neutral-text">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {nilaiHistory.map((nilai, index) => (
                        <motion.tr
                          key={nilai._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: index * 0.05,
                            duration: 0.3,
                            ease: [0.25, 0.46, 0.45, 0.94],
                          }}
                          className="border-b border-neutral-border/50 hover:bg-neutral-light/5 transition-colors"
                        >
                          <td className="py-3 px-4 text-sm text-neutral-text">
                            {nilai.siswa?.name || "-"}
                          </td>
                          <td className="py-3 px-4 text-sm text-neutral-secondary">
                            {nilai.siswa?.identifier || "-"}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {editingNilaiId === nilai._id ? (
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={editNilai}
                                onChange={(e) => setEditNilai(e.target.value)}
                                className="w-16 px-2 py-1 border border-primary rounded text-center focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            ) : (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                  delay: index * 0.05 + 0.1,
                                  type: "spring",
                                  stiffness: 300,
                                }}
                                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                                  nilai.nilai >= 75
                                    ? "bg-success/10 text-success"
                                    : "bg-danger/10 text-danger"
                                }`}
                              >
                                {nilai.nilai}
                              </motion.span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm text-neutral-secondary">
                            {editingNilaiId === nilai._id ? (
                              <input
                                type="text"
                                value={editDeskripsi}
                                onChange={(e) =>
                                  setEditDeskripsi(e.target.value)
                                }
                                className="w-full px-2 py-1 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Deskripsi"
                              />
                            ) : (
                              nilai.deskripsi || "-"
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{
                                delay: index * 0.05 + 0.15,
                                type: "spring",
                                stiffness: 300,
                              }}
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                nilai.nilai >= 75
                                  ? "bg-success/10 text-success"
                                  : "bg-danger/10 text-danger"
                              }`}
                            >
                              {nilai.nilai >= 75 ? "Tuntas" : "Belum Tuntas"}
                            </motion.span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {editingNilaiId === nilai._id ? (
                                <>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => {
                                      handleUpdateNilai(
                                        nilai._id,
                                        editNilai,
                                        editDeskripsi
                                      );
                                      setEditingNilaiId(null);
                                    }}
                                    className="p-1.5 bg-success/10 text-success rounded-lg hover:bg-success/20 transition-colors"
                                    title="Simpan"
                                  >
                                    <Save className="w-4 h-4" />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setEditingNilaiId(null)}
                                    className="p-1.5 bg-neutral-light/20 text-neutral-secondary rounded-lg hover:bg-neutral-light/30 transition-colors"
                                    title="Batal"
                                  >
                                    <X className="w-4 h-4" />
                                  </motion.button>
                                </>
                              ) : (
                                <>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => {
                                      setEditingNilaiId(nilai._id);
                                      setEditNilai(nilai.nilai);
                                      setEditDeskripsi(nilai.deskripsi || "");
                                    }}
                                    className="p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                                    title="Edit"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleDeleteNilai(nilai._id)}
                                    className="p-1.5 bg-danger/10 text-danger rounded-lg hover:bg-danger/20 transition-colors"
                                    title="Hapus"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </motion.button>
                                </>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Daftar Siswa yang Belum Ada Nilai */}
      {selectedKelas && selectedMapel && selectedJenis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6"
        >
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-neutral-text">
                Siswa yang Belum Ada Nilai
              </h2>
            </div>

            {(() => {
              const siswaYangSudahAda = new Set(
                nilaiHistory.map((n) => n.siswa?._id)
              );
              const siswaBelumAda = siswaList.filter(
                (s) => !siswaYangSudahAda.has(s._id)
              );

              if (siswaBelumAda.length === 0) {
                return (
                  <div className="text-center py-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <Users className="w-12 h-12 mx-auto mb-3 text-success" />
                    </motion.div>
                    <p className="text-neutral-secondary">
                      Semua siswa sudah memiliki nilai
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-2">
                  {siswaBelumAda.map((siswa, index) => (
                    <motion.div
                      key={siswa._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 bg-warning/5 border border-warning/20 rounded-lg hover:bg-warning/10 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-neutral-text">
                          {siswa.name}
                        </p>
                        <p className="text-sm text-neutral-secondary">
                          NIS: {siswa.identifier}
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedSiswa(siswa);
                          setShowSingleInput(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Input Nilai
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              );
            })()}
          </Card>
        </motion.div>
      )}
      {/* Bulk Input Modal */}
      <BulkInputModal
        show={showBulkInput}
        onClose={() => setShowBulkInput(false)}
        siswaList={siswaList}
        selectedJenis={selectedJenis}
        semester={semester}
        tahunAjaran={tahunAjaran}
        onSubmit={handleBulkSubmit}
      />
      {selectedSiswa && (
        <SingleInputModal
          show={showSingleInput}
          onClose={() => {
            setShowSingleInput(false);
            setSelectedSiswa(null);
          }}
          siswa={selectedSiswa}
          selectedJenis={selectedJenis}
          semester={semester}
          tahunAjaran={tahunAjaran}
          onSubmit={handleSingleSubmit}
        />
      )}
    </div>
  );
}
