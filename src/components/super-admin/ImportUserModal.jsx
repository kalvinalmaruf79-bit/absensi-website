"use client";
import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import {
  Download,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function ImportUserModal({ isOpen, onClose, onImport }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (
        !selectedFile.name.endsWith(".xlsx") &&
        !selectedFile.name.endsWith(".xls")
      ) {
        alert("File harus berformat Excel (.xlsx atau .xls)");
        e.target.value = null;
        return;
      }
      setFile(selectedFile);
      setPreview({
        name: selectedFile.name,
        size: (selectedFile.size / 1024).toFixed(2) + " KB",
      });
    }
  };

  const handleImport = async () => {
    if (!file) {
      alert("Pilih file terlebih dahulu");
      return;
    }
    setLoading(true);
    await onImport(file);
    setLoading(false);
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setLoading(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import User dari Excel"
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleImport}
            loading={loading}
            disabled={!file}
          >
            Import Data
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* File Upload Section */}
        <div>
          <label className="block text-sm font-medium text-neutral-text mb-2">
            Pilih File Excel
          </label>
          <div className="mt-2">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={loading}
              className="block w-full text-sm text-neutral-text
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-primary-main file:text-white
                hover:file:bg-primary-hover
                file:cursor-pointer
                cursor-pointer
                border border-neutral-border rounded-lg
                focus:outline-none focus:ring-2 focus:ring-primary-main"
            />
          </div>
          {preview && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">
                  File terpilih: {preview.name}
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Ukuran: {preview.size}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Format Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-3">
                Format File Excel
              </h4>
              <div className="space-y-3 text-sm text-blue-800">
                <div>
                  <p className="font-medium mb-2">
                    Kolom yang diperlukan (urutan harus tepat):
                  </p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>
                      <code className="bg-blue-100 px-1 py-0.5 rounded">
                        nama
                      </code>{" "}
                      - Nama lengkap user
                    </li>
                    <li>
                      <code className="bg-blue-100 px-1 py-0.5 rounded">
                        email
                      </code>{" "}
                      - Email valid
                    </li>
                    <li>
                      <code className="bg-blue-100 px-1 py-0.5 rounded">
                        identifier
                      </code>{" "}
                      - NIP untuk guru, NISN untuk siswa
                    </li>
                    <li>
                      <code className="bg-blue-100 px-1 py-0.5 rounded">
                        role
                      </code>{" "}
                      - Harus diisi:{" "}
                      <code className="bg-blue-100 px-1 py-0.5 rounded">
                        guru
                      </code>{" "}
                      atau{" "}
                      <code className="bg-blue-100 px-1 py-0.5 rounded">
                        siswa
                      </code>
                    </li>
                    <li>
                      <code className="bg-blue-100 px-1 py-0.5 rounded">
                        kelas
                      </code>{" "}
                      - Nama kelas (wajib untuk siswa, kosongkan untuk guru)
                    </li>
                    <li>
                      <code className="bg-blue-100 px-1 py-0.5 rounded">
                        tahunAjaran
                      </code>{" "}
                      - Format: 2025/2026 (opsional, akan menggunakan tahun
                      ajaran aktif jika kosong)
                    </li>
                  </ol>
                </div>

                <div className="border-t border-blue-200 pt-3">
                  <p className="font-medium mb-2">Catatan Penting:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>
                      Password otomatis akan sama dengan{" "}
                      <code className="bg-blue-100 px-1 py-0.5 rounded">
                        identifier
                      </code>
                    </li>
                    <li>
                      Untuk siswa: Nama kelas harus <strong>persis sama</strong>{" "}
                      dengan yang ada di sistem
                    </li>
                    <li>
                      Jika tahun ajaran tidak diisi, sistem akan menggunakan
                      tahun ajaran aktif
                    </li>
                    <li>
                      Pastikan tidak ada email atau identifier yang duplikat
                    </li>
                    <li>
                      Pastikan kelas sudah dibuat di sistem sebelum import
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Download Template */}
        <div className="bg-gradient-to-r from-primary-surface to-blue-50 border border-primary-main rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-primary-main mb-1">
                Template Excel
              </h4>
              <p className="text-sm text-neutral-secondary">
                Download template untuk memudahkan proses import
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={<Download className="w-4 h-4" />}
              onClick={() => {
                const link = document.createElement("a");
                link.href = "/templates/template-import-user.xlsx";
                link.download = "template-import-user.xlsx";
                link.click();
              }}
            >
              Download
            </Button>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900 mb-1">
                Perhatian
              </p>
              <p className="text-sm text-amber-800">
                Proses import dapat memakan waktu tergantung jumlah data.
                Pastikan koneksi internet stabil dan jangan tutup halaman hingga
                proses selesai.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
