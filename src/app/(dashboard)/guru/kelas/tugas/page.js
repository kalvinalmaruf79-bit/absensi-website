// src/app/(dashboard)/guru/kelas/tugas/page.js
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Loader2,
  FileText,
  CheckCircle2,
  Clock,
  Filter,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import { tugasService } from "@/services/tugas.service";
import { guruService } from "@/services/guru.service";
import { showToast } from "@/lib/toast";
import CreateTugasModal from "@/components/guru/CreateTugasModal";
import EditTugasModal from "@/components/guru/EditTugasModal";
import DeleteTugasModal from "@/components/guru/DeleteTugasModal";
import TugasCard from "@/components/guru/TugasCard";

export default function ManajemenTugasPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [tugas, setTugas] = useState([]);
  const [filteredTugas, setFilteredTugas] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTugas, setSelectedTugas] = useState(null);
  const [selectedKelas, setSelectedKelas] = useState("all");
  const [selectedMapel, setSelectedMapel] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [kelasList, setKelasList] = useState([]);
  const [mataPelajaranList, setMataPelajaranList] = useState([]);

  const [stats, setStats] = useState({
    totalTugas: 0,
    tugasAktif: 0,
    tugasSelesai: 0,
    menunggupenilaian: 0,
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    filterTugas();
  }, [tugas, searchQuery, selectedKelas, selectedMapel, selectedStatus]);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);

      const kelasResponse = await guruService.getKelasDiampu();
      if (kelasResponse.success !== false) {
        setKelasList(kelasResponse);
      }

      const mapelResponse = await guruService.getMataPelajaranDiampu();
      if (mapelResponse.success !== false) {
        setMataPelajaranList(mapelResponse);
      }

      await fetchAllTugas();
    } catch (error) {
      console.error("Error fetching initial data:", error);
      showToast.error("Gagal memuat data. Silakan refresh halaman.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllTugas = async () => {
    try {
      const allTugasPromises = [];

      // Jika ada filter spesifik, langsung query
      if (selectedKelas !== "all" && selectedMapel !== "all") {
        const response = await tugasService.getTugasByKelas({
          kelasId: selectedKelas,
          mataPelajaranId: selectedMapel,
        });
        const tugasData = Array.isArray(response) ? response : [];
        setTugas(tugasData);
        calculateStats(tugasData);
        return;
      }

      // Ambil semua kelas dan mapel yang diampu
      const [kelasResponse, mapelResponse] = await Promise.all([
        guruService.getKelasDiampu(),
        guruService.getMataPelajaranDiampu(),
      ]);

      const kelas = Array.isArray(kelasResponse) ? kelasResponse : [];
      const mapel = Array.isArray(mapelResponse) ? mapelResponse : [];

      if (kelas.length === 0 || mapel.length === 0) {
        setTugas([]);
        calculateStats([]);
        return;
      }

      // Fetch tugas untuk setiap kombinasi kelas dan mapel
      for (const k of kelas) {
        for (const m of mapel) {
          allTugasPromises.push(
            tugasService
              .getTugasByKelas({
                kelasId: k._id,
                mataPelajaranId: m._id,
              })
              .catch((err) => {
                console.error(
                  `Error fetching tugas for kelas ${k.nama} and mapel ${m.nama}:`,
                  err
                );
                return [];
              })
          );
        }
      }

      const allTugasResults = await Promise.all(allTugasPromises);
      const allTugasFlat = allTugasResults.flat();

      // Deduplikasi berdasarkan _id
      const uniqueTugas = Array.from(
        new Map(allTugasFlat.map((item) => [item._id, item])).values()
      );

      setTugas(uniqueTugas);
      calculateStats(uniqueTugas);
    } catch (error) {
      console.error("Error fetching tugas:", error);
      showToast.error(
        error.response?.data?.message || "Gagal memuat daftar tugas."
      );
      setTugas([]);
      calculateStats([]);
    }
  };

  const calculateStats = (tugasList) => {
    const now = new Date();
    const aktif = tugasList.filter((t) => new Date(t.deadline) > now);
    const selesai = tugasList.filter((t) => new Date(t.deadline) <= now);

    let menungguPenilaian = 0;
    tugasList.forEach((t) => {
      const submissionsWithoutGrade = t.submissions?.filter(
        (sub) => sub.nilai === undefined || sub.nilai === null
      );
      menungguPenilaian += submissionsWithoutGrade?.length || 0;
    });

    setStats({
      totalTugas: tugasList.length,
      tugasAktif: aktif.length,
      tugasSelesai: selesai.length,
      menunggupenilaian: menungguPenilaian,
    });
  };

  const filterTugas = () => {
    let filtered = [...tugas];

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.judul.toLowerCase().includes(query) ||
          t.deskripsi.toLowerCase().includes(query)
      );
    }

    if (selectedKelas !== "all") {
      filtered = filtered.filter((t) => t.kelas?._id === selectedKelas);
    }

    if (selectedMapel !== "all") {
      filtered = filtered.filter((t) => t.mataPelajaran?._id === selectedMapel);
    }

    if (selectedStatus !== "all") {
      const now = new Date();
      if (selectedStatus === "aktif") {
        filtered = filtered.filter((t) => new Date(t.deadline) > now);
      } else if (selectedStatus === "selesai") {
        filtered = filtered.filter((t) => new Date(t.deadline) <= now);
      }
    }

    setFilteredTugas(filtered);
  };

  const handleCreateTugas = async (data) => {
    try {
      await tugasService.createTugas(data);
      showToast.success("Tugas berhasil dibuat!");
      setShowCreateModal(false);
      fetchAllTugas();
    } catch (error) {
      console.error("Error creating tugas:", error);
      showToast.error(error.response?.data?.message || "Gagal membuat tugas.");
    }
  };

  const handleEditTugas = (tugas) => {
    setSelectedTugas(tugas);
    setShowEditModal(true);
  };

  const handleUpdateTugas = async (tugasId, data) => {
    try {
      await tugasService.updateTugas(tugasId, data);
      showToast.success("Tugas berhasil diperbarui!");
      setShowEditModal(false);
      setSelectedTugas(null);
      fetchAllTugas();
    } catch (error) {
      console.error("Error updating tugas:", error);
      showToast.error(
        error.response?.data?.message || "Gagal memperbarui tugas."
      );
    }
  };

  const handleDeleteClick = (tugas) => {
    setSelectedTugas(tugas);
    setShowDeleteModal(true);
  };

  const handleDeleteTugas = async (tugasId) => {
    try {
      await tugasService.deleteTugas(tugasId);
      showToast.success("Tugas berhasil dihapus!");
      setShowDeleteModal(false);
      setSelectedTugas(null);
      fetchAllTugas();
    } catch (error) {
      console.error("Error deleting tugas:", error);
      showToast.error(
        error.response?.data?.message || "Gagal menghapus tugas."
      );
    }
  };

  const handleViewSubmissions = (tugasId) => {
    router.push(`/guru/kelas/tugas/${tugasId}/submissions`);
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
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-text mb-2">
              Manajemen Tugas
            </h1>
            <p className="text-neutral-secondary">
              Kelola dan monitor tugas siswa Anda
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-darkest text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>Buat Tugas Baru</span>
          </motion.button>
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
              <p className="text-sm text-neutral-secondary mb-1">Total Tugas</p>
              <p className="text-3xl font-bold text-neutral-text">
                {stats.totalTugas}
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
              <p className="text-sm text-neutral-secondary mb-1">Tugas Aktif</p>
              <p className="text-3xl font-bold text-success">
                {stats.tugasAktif}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success to-success-dark flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-hover transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-neutral-secondary mb-1">
                Tugas Selesai
              </p>
              <p className="text-3xl font-bold text-info">
                {stats.tugasSelesai}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-info to-info-dark flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-hover transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-neutral-secondary mb-1">
                Menunggu Penilaian
              </p>
              <p className="text-3xl font-bold text-warning">
                {stats.menunggupenilaian}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warning to-warning-dark flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6 space-y-4"
      >
        <Card>
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-neutral-tertiary" />
            <input
              type="text"
              placeholder="Cari tugas berdasarkan judul atau deskripsi..."
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

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-neutral-secondary" />
            <h3 className="font-semibold text-neutral-text">Filter</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-neutral-secondary mb-2">
                Kelas
              </label>
              <select
                value={selectedKelas}
                onChange={(e) => setSelectedKelas(e.target.value)}
                className="w-full px-4 py-2 bg-neutral-light/10 border border-neutral-border rounded-lg outline-none focus:border-primary transition-colors"
              >
                <option value="all">Semua Kelas</option>
                {kelasList.map((kelas) => (
                  <option key={kelas._id} value={kelas._id}>
                    {kelas.nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-neutral-secondary mb-2">
                Mata Pelajaran
              </label>
              <select
                value={selectedMapel}
                onChange={(e) => setSelectedMapel(e.target.value)}
                className="w-full px-4 py-2 bg-neutral-light/10 border border-neutral-border rounded-lg outline-none focus:border-primary transition-colors"
              >
                <option value="all">Semua Mata Pelajaran</option>
                {mataPelajaranList.map((mapel) => (
                  <option key={mapel._id} value={mapel._id}>
                    {mapel.nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-neutral-secondary mb-2">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 bg-neutral-light/10 border border-neutral-border rounded-lg outline-none focus:border-primary transition-colors"
              >
                <option value="all">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="selesai">Selesai</option>
              </select>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Tugas List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-neutral-text">
              Daftar Tugas
            </h2>
            {filteredTugas.length > 0 && (
              <span className="text-sm text-neutral-secondary">
                Menampilkan {filteredTugas.length} dari {stats.totalTugas} tugas
              </span>
            )}
          </div>

          {filteredTugas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTugas.map((tugasItem, index) => (
                <TugasCard
                  key={tugasItem._id}
                  tugas={tugasItem}
                  index={index}
                  onViewSubmissions={handleViewSubmissions}
                  onEdit={handleEditTugas}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-neutral-light" />
              <p className="text-neutral-secondary mb-2">
                {searchQuery ||
                selectedKelas !== "all" ||
                selectedMapel !== "all"
                  ? "Tidak ada tugas yang sesuai dengan filter"
                  : "Belum ada tugas yang dibuat"}
              </p>
              {(searchQuery ||
                selectedKelas !== "all" ||
                selectedMapel !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedKelas("all");
                    setSelectedMapel("all");
                    setSelectedStatus("all");
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

      {/* Modals */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateTugasModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateTugas}
            kelasList={kelasList}
            mataPelajaranList={mataPelajaranList}
          />
        )}

        {showEditModal && selectedTugas && (
          <EditTugasModal
            tugas={selectedTugas}
            onClose={() => {
              setShowEditModal(false);
              setSelectedTugas(null);
            }}
            onUpdate={handleUpdateTugas}
            kelasList={kelasList}
            mataPelajaranList={mataPelajaranList}
          />
        )}

        {showDeleteModal && selectedTugas && (
          <DeleteTugasModal
            tugas={selectedTugas}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedTugas(null);
            }}
            onDelete={handleDeleteTugas}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
