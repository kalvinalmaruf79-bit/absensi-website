// src/components/super-admin/ImportUserModal.jsx
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

export default function ImportUserModal({ isOpen, onClose, onImport }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (
        !selectedFile.name.endsWith(".xlsx") &&
        !selectedFile.name.endsWith(".xls")
      ) {
        setError("File harus berformat Excel (.xlsx atau .xls)");
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError("Pilih file terlebih dahulu");
      return;
    }
    setLoading(true);
    try {
      await onImport(file);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import User dari Excel"
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleImport} loading={loading}>
            Import
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {error && (
          <Alert type="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <div>
          <label className="block text-sm font-medium text-neutral-text mb-2">
            Pilih File Excel
          </label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="w-full px-4 py-2 border border-neutral-border rounded-lg"
          />
          {file && (
            <p className="mt-2 text-sm text-success">
              File terpilih: {file.name}
            </p>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">
            Format File Excel:
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • Kolom: Name, Email, Identifier (NIP/NISN), Role, Kelas (untuk
              siswa)
            </li>
            <li>• Role: "guru" atau "siswa"</li>
            <li>• Password akan di-generate otomatis</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}
