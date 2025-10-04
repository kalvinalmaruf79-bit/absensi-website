// src/app/(dashboard)/guru/kelas/materi/edit/[id]/page.js
"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Upload,
  X,
  FileText,
  Plus,
  Loader2,
  BookOpen,
  Trash2,
} from "lucide-react";
import Card from "@/components/ui/Card";
import { materiService } from "@/services/materi.service";
import { showToast } from "@/lib/toast";

export default function EditMateriPage({ params }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [materiData, setMateriData] = useState(null);
  const [formData, setFormData] = useState({
    judul: "",
    deskripsi: "",
  });
  const [newFiles, setNewFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [links, setLinks] = useState([{ title: "", url: "" }]);

  useEffect(() => {
    const fetchMateri = async () => {
      try {
        const data = await materiService.getMateriById(unwrappedParams.id);
        setMateriData(data);
        setFormData({
          judul: data.judul,
          deskripsi: data.deskripsi,
        });
        setExistingFiles(data.files || []);
        setLinks(
          data.links && data.links.length > 0
            ? data.links
            : [{ title: "", url: "" }]
        );
      } catch (error) {
        console.error("Error fetching materi:", error);
        showToast.error("Gagal memuat data materi");
        router.push("/guru/kelas/materi");
      } finally {
        setIsLoading(false);
      }
    };

    if (unwrappedParams.id) {
      fetchMateri();
    }
  }, [unwrappedParams.id, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const totalFiles =
      existingFiles.length + newFiles.length + selectedFiles.length;

    if (totalFiles > 5) {
      showToast.error("Maksimal 5 file");
      return;
    }

    setNewFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeNewFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingFile = async (filePublicId) => {
    try {
      // Encode public_id untuk URL - PENTING!
      const encodedPublicId = encodeURIComponent(filePublicId);

      await materiService.deleteMateriFile(unwrappedParams.id, encodedPublicId);

      setExistingFiles((prev) =>
        prev.filter((f) => f.public_id !== filePublicId)
      );
      showToast.success("File berhasil dihapus");
    } catch (error) {
      console.error("Error deleting file:", error);
      showToast.error(error.response?.data?.message || "Gagal menghapus file");
    }
  };

  const handleLinkChange = (index, field, value) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);
  };

  const addLink = () => {
    setLinks((prev) => [...prev, { title: "", url: "" }]);
  };

  const removeLink = (index) => {
    if (links.length > 1) {
      setLinks((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.judul || !formData.deskripsi) {
      showToast.error("Judul dan deskripsi wajib diisi");
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append("judul", formData.judul);
      submitData.append("deskripsi", formData.deskripsi);

      // Append new files
      newFiles.forEach((file) => {
        submitData.append("files", file);
      });

      // Filter dan append links yang valid
      const validLinks = links.filter((link) => link.title && link.url);
      if (validLinks.length > 0) {
        submitData.append("links", JSON.stringify(validLinks));
      }

      const response = await materiService.updateMateri(
        unwrappedParams.id,
        submitData
      );

      showToast.success(response.message || "Materi berhasil diupdate");

      // Redirect setelah delay
      setTimeout(() => {
        router.push("/guru/kelas/materi");
      }, 500);
    } catch (error) {
      console.error("Error updating materi:", error);
      showToast.error(
        error.response?.data?.message || "Gagal mengupdate materi"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-main animate-spin" />
        </div>
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
          className="flex items-center gap-2 text-neutral-secondary hover:text-neutral-text mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Kembali
        </button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00a3d4] to-[#005f8b] flex items-center justify-center shadow-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-text">
              Edit Materi
            </h1>
            <p className="text-neutral-secondary mt-1">
              Update informasi materi pembelajaran
            </p>
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Judul */}
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Judul Materi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="judul"
                value={formData.judul}
                onChange={handleInputChange}
                placeholder="Contoh: Pengenalan Algoritma Pemrograman"
                className="w-full px-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main"
                required
              />
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Deskripsi <span className="text-red-500">*</span>
              </label>
              <textarea
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleInputChange}
                placeholder="Jelaskan isi materi secara singkat..."
                rows={4}
                className="w-full px-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main resize-none"
                required
              />
            </div>

            {/* Existing Files */}
            {existingFiles.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">
                  File Yang Sudah Ada
                </label>
                <div className="space-y-2">
                  {existingFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {file.fileName}
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingFile(file.public_id)}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                        title="Hapus file"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New File Upload */}
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Tambah File Baru (Total maksimal 5 file)
              </label>
              <div className="border-2 border-dashed border-neutral-border rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  disabled={existingFiles.length + newFiles.length >= 5}
                />
                <label
                  htmlFor="file-upload"
                  className={`cursor-pointer flex flex-col items-center ${
                    existingFiles.length + newFiles.length >= 5
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <Upload className="w-12 h-12 text-neutral-secondary mb-2" />
                  <p className="text-sm text-neutral-secondary">
                    Klik untuk upload file (PDF, DOC, PPT, XLS)
                  </p>
                  <p className="text-xs text-neutral-secondary mt-1">
                    {existingFiles.length + newFiles.length}/5 file
                  </p>
                </label>
              </div>

              {newFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {newFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span className="text-sm text-neutral-text">
                          {file.name}
                        </span>
                        <span className="text-xs text-neutral-secondary">
                          ({(file.size / 1024).toFixed(2)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNewFile(index)}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Links */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-neutral-text">
                  Link Referensi
                </label>
                <button
                  type="button"
                  onClick={addLink}
                  className="text-sm text-primary-main hover:text-primary-dark flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Link
                </button>
              </div>
              <div className="space-y-3">
                {links.map((link, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-green-50 rounded-lg"
                  >
                    <input
                      type="text"
                      placeholder="Judul link"
                      value={link.title}
                      onChange={(e) =>
                        handleLinkChange(index, "title", e.target.value)
                      }
                      className="px-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main"
                    />
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://example.com"
                        value={link.url}
                        onChange={(e) =>
                          handleLinkChange(index, "url", e.target.value)
                        }
                        className="flex-1 px-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main"
                      />
                      {links.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLink(index)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5 text-red-600" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 justify-end pt-6 border-t border-neutral-border">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="px-6 py-2 border border-neutral-border text-neutral-text rounded-lg hover:bg-neutral-surface transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-gradient-to-br from-[#00a3d4] to-[#005f8b] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 font-semibold shadow-md disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Update Materi"
                )}
              </button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
