"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Send,
  FileDown,
  Inbox,
} from "lucide-react";
import Card from "@/components/ui/Card";
import { guruService } from "@/services/guru.service";
import { showToast } from "@/lib/toast";

export default function ValidasiAbsensiPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const [pengajuan, setPengajuan] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPengajuan, setSelectedPengajuan] = useState(null);
  const [catatan, setCatatan] = useState("");
  const [reviewStatus, setReviewStatus] = useState(""); // 'disetujui' or 'ditolak'

  const TABS = [
    { id: "pending", label: "Menunggu", icon: <Clock className="w-4 h-4" /> },
    {
      id: "disetujui",
      label: "Disetujui",
      icon: <CheckCircle className="w-4 h-4" />,
    },
    { id: "ditolak", label: "Ditolak", icon: <XCircle className="w-4 h-4" /> },
  ];

  useEffect(() => {
    fetchPengajuan(activeTab);
  }, [activeTab]);

  const fetchPengajuan = async (status) => {
    setIsLoading(true);
    try {
      const response = await guruService.getPengajuanAbsensi({ status });
      setPengajuan(response.data || []);
    } catch (error) {
      showToast.error(
        error.response?.data?.message || "Gagal memuat data pengajuan"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (item, status) => {
    setSelectedPengajuan(item);
    setReviewStatus(status);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPengajuan(null);
    setCatatan("");
    setReviewStatus("");
  };

  const handleSubmitReview = async () => {
    if (!selectedPengajuan) return;

    setIsLoading(true);
    try {
      await guruService.reviewPengajuanAbsensi(selectedPengajuan._id, {
        status: reviewStatus,
        catatan,
      });
      showToast.success(`Pengajuan berhasil di${reviewStatus}`);
      fetchPengajuan(activeTab); // Refresh data
      closeModal();
    } catch (error) {
      showToast.error(
        error.response?.data?.message || "Gagal memproses pengajuan"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00a3d4] to-[#005f8b] flex items-center justify-center shadow-lg">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-text">
              Validasi Absensi
            </h1>
            <p className="text-neutral-secondary mt-1">
              Tinjau dan validasi pengajuan absensi dari siswa perwalian Anda
            </p>
          </div>
        </div>
      </motion.div>

      <Card>
        {/* Tabs */}
        <div className="border-b border-neutral-border mb-6">
          <nav className="flex space-x-4">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-b-2 border-primary-main text-primary-main"
                    : "text-neutral-secondary hover:text-neutral-text"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary-main" />
          </div>
        ) : pengajuan.length > 0 ? (
          <div className="space-y-4">
            {pengajuan.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border border-neutral-border rounded-lg"
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="font-bold text-neutral-text">
                      {item.siswa.name}
                    </p>
                    <p className="text-sm text-neutral-secondary">
                      NIS: {item.siswa.identifier}
                    </p>
                    <div className="mt-2 text-sm space-y-1">
                      <p>
                        <strong>Tanggal:</strong>{" "}
                        {new Date(item.tanggal).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      <p>
                        <strong>Keterangan:</strong>{" "}
                        <span className="capitalize font-medium">
                          {item.keterangan}
                        </span>
                      </p>
                      <p>
                        <strong>Alasan:</strong> {item.alasan}
                      </p>
                      {item.catatanWaliKelas && (
                        <p className="text-xs italic mt-2 text-blue-600">
                          <strong>Catatan:</strong> {item.catatanWaliKelas}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-4 md:mt-0">
                    {item.fileBukti && (
                      <a
                        href={item.fileBukti}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 text-sm border border-neutral-border rounded-lg flex items-center gap-2 hover:bg-neutral-surface"
                      >
                        <FileDown className="w-4 h-4" /> Lihat Bukti
                      </a>
                    )}
                    {activeTab === "pending" && (
                      <>
                        <button
                          onClick={() => openModal(item, "ditolak")}
                          className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" /> Tolak
                        </button>
                        <button
                          onClick={() => openModal(item, "disetujui")}
                          className="px-4 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" /> Setujui
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Inbox className="w-16 h-16 mx-auto text-neutral-disabled mb-4" />
            <p className="font-semibold text-xl">Tidak Ada Pengajuan</p>
            <p className="text-neutral-secondary mt-1">
              Saat ini tidak ada pengajuan absensi dengan status '{activeTab}'.
            </p>
          </div>
        )}
      </Card>

      {/* Modal Konfirmasi */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
          >
            <h2 className="text-xl font-bold mb-4">
              Konfirmasi Tindakan:{" "}
              <span className="capitalize">{reviewStatus}</span>
            </h2>
            <p className="text-sm text-neutral-secondary mb-4">
              Anda akan {reviewStatus} pengajuan absensi untuk siswa{" "}
              <span className="font-bold">{selectedPengajuan?.siswa.name}</span>
              .
            </p>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Tambahkan catatan (opsional)..."
              className="w-full p-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main"
              rows="3"
            ></textarea>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm border border-neutral-border rounded-lg hover:bg-neutral-surface"
              >
                Batal
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={isLoading}
                className={`px-4 py-2 text-sm text-white rounded-lg flex items-center gap-2 ${
                  reviewStatus === "disetujui"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                } disabled:opacity-50`}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Kirim Konfirmasi
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
