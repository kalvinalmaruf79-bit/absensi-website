// src/components/super-admin/ImportUserModal.jsx
"use client";
import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

export default function ImportUserModal({ isOpen, onClose, onImport }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  // State error tidak lagi diperlukan di sini
  // const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (
        !selectedFile.name.endsWith(".xlsx") &&
        !selectedFile.name.endsWith(".xls")
      ) {
        // Kita bisa langsung menggunakan toast di sini jika mau, atau biarkan validasi utama di backend
        alert("File harus berformat Excel (.xlsx atau .xls)");
        e.target.value = null; // Reset input file
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file) {
      alert("Pilih file terlebih dahulu");
      return;
    }
    setLoading(true);
    // onImport sekarang menangani notifikasi sukses/gagalnya sendiri
    await onImport(file);
    // Kita tidak perlu menangani error di sini lagi
    setLoading(false);
    // Modal akan ditutup dari parent component jika sukses
  };

  // Reset state saat modal ditutup
  const handleClose = () => {
    setFile(null);
    setLoading(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import User dari Excel"
      size="md"
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
            Import
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-text mb-2">
            Pilih File Excel
          </label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="w-full text-sm text-neutral-text file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-surface file:text-primary-main hover:file:bg-primary-hover"
          />
          {file && (
            <p className="mt-2 text-sm text-green-600">
              File terpilih: {file.name}
            </p>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">
            Format File Excel:
          </h4>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>
              Kolom: `nama`, `email`, `identifier` (NIP/NISN), `role`, `kelas`
              (wajib untuk siswa)
            </li>
            <li>Role harus diisi: `guru` atau `siswa`</li>
            <li>Password akan di-generate otomatis dari `identifier`</li>
          </ul>
          <a
            href="/templates/template-import-user.xlsx"
            download
            className="text-sm font-medium text-primary-main hover:underline mt-3 inline-block"
          >
            Unduh Template Excel
          </a>
        </div>
      </div>
    </Modal>
  );
}
