// src/components/super-admin/PengumumanList.jsx
"use client";
import { useState, useEffect } from "react";
import { pengumumanService } from "@/services/pengumuman.service";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  PowerOff,
  Power,
  Calendar,
  Users,
  AlertCircle,
  Loader2,
} from "lucide-react";
import PengumumanModal from "./PengumumanModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

export default function PengumumanList() {
  const [pengumumanList, setPengumumanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedPengumuman, setSelectedPengumuman] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchPengumuman();
  }, []);

  const fetchPengumuman = async () => {
    try {
      setLoading(true);
      const data = await pengumumanService.getPengumuman();
      setPengumumanList(data);
    } catch (error) {
      console.error("Error fetching pengumuman:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedPengumuman(null);
    setShowModal(true);
  };

  const handleEdit = (pengumuman) => {
    setSelectedPengumuman(pengumuman);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await pengumumanService.deletePengumuman(deleteId);
      fetchPengumuman();
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting pengumuman:", error);
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      await pengumumanService.togglePublish(id);
      fetchPengumuman();
    } catch (error) {
      console.error("Error toggling publish:", error);
    }
  };

  const filteredPengumuman = pengumumanList.filter((item) => {
    const matchSearch =
      item.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.isi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter =
      filterStatus === "all" ||
      (filterStatus === "published" && item.isPublished) ||
      (filterStatus === "draft" && !item.isPublished);
    return matchSearch && matchFilter;
  });

  const getTargetRoleLabel = (role) => {
    switch (role) {
      case "guru":
        return "Guru";
      case "siswa":
        return "Siswa";
      case "semua":
        return "Semua";
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#00a3d4] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Manajemen Pengumuman
          </h1>
          <p className="text-gray-600 mt-1">
            Kelola pengumuman untuk guru dan siswa
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00a3d4] to-[#00b2e2] text-white rounded-xl hover:shadow-lg transition-all"
        >
          <Plus size={20} />
          Buat Pengumuman
        </motion.button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Cari pengumuman..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00a3d4]/20 focus:border-[#00a3d4] outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00a3d4]/20 focus:border-[#00a3d4] outline-none transition-all"
            >
              <option value="all">Semua Status</option>
              <option value="published">Dipublikasi</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Pengumuman List */}
      <div className="grid gap-4">
        <AnimatePresence>
          {filteredPengumuman.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100"
            >
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Tidak ada pengumuman ditemukan</p>
            </motion.div>
          ) : (
            filteredPengumuman.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {item.judul}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.isPublished
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {item.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {item.isi}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        {new Date(item.createdAt).toLocaleDateString("id-ID")}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={16} />
                        Target: {getTargetRoleLabel(item.targetRole)}
                      </div>
                      {item.targetKelas && item.targetKelas.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {item.targetKelas.length} Kelas
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleTogglePublish(item._id)}
                      className={`p-2 rounded-lg transition-colors ${
                        item.isPublished
                          ? "bg-red-50 text-red-600 hover:bg-red-100"
                          : "bg-green-50 text-green-600 hover:bg-green-100"
                      }`}
                      title={item.isPublished ? "Unpublish" : "Publish"}
                    >
                      {item.isPublished ? (
                        <PowerOff size={18} />
                      ) : (
                        <Power size={18} />
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEdit(item)}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(item._id)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      title="Hapus"
                    >
                      <Trash2 size={18} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showModal && (
          <PengumumanModal
            pengumuman={selectedPengumuman}
            onClose={() => {
              setShowModal(false);
              setSelectedPengumuman(null);
            }}
            onSuccess={fetchPengumuman}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteModal && (
          <DeleteConfirmModal
            title="Hapus Pengumuman"
            message="Apakah Anda yakin ingin menghapus pengumuman ini? Tindakan ini tidak dapat dibatalkan."
            onConfirm={confirmDelete}
            onCancel={() => {
              setShowDeleteModal(false);
              setDeleteId(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
