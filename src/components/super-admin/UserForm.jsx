"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { superAdminService } from "@/services/super-admin.service";
import { handleApiError } from "@/lib/api-helpers";
import { showToast } from "@/lib/toast"; // Asumsi Anda punya toast

export default function UserForm({
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
  mode = "create", // "create" or "edit"
}) {
  const [formData, setFormData] = useState({
    role: initialData.role || "siswa", // Default ke siswa
    name: initialData.name || "",
    email: initialData.email || "",
    identifier: initialData.identifier || "",
    password: "",
    confirmPassword: "",
    kelas: initialData.kelas?._id || initialData.kelas || "",
  });

  const [errors, setErrors] = useState({});
  const [kelasList, setKelasList] = useState([]);
  const [loadingKelas, setLoadingKelas] = useState(false);

  // Load kelas list when role is siswa
  useEffect(() => {
    if (formData.role === "siswa") {
      loadKelas();
    }
  }, [formData.role]);

  const loadKelas = async () => {
    setLoadingKelas(true);
    try {
      const response = await superAdminService.getAllKelas({
        isActive: true,
        limit: 1000, // Ambil semua kelas aktif
      });

      let kelasData = response.data || response.docs || [];
      setKelasList(kelasData);
    } catch (err) {
      console.error("Error loading kelas:", err);
      handleApiError(err);
      setKelasList([]);
    } finally {
      setLoadingKelas(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.role) {
      newErrors.role = "Role harus dipilih";
    }
    if (!formData.name.trim()) {
      newErrors.name = "Nama harus diisi";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email harus diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }
    if (!formData.identifier.trim()) {
      newErrors.identifier = `${
        formData.role === "guru" ? "NIP" : "NISN"
      } harus diisi`;
    }

    // Validasi password HANYA untuk mode 'create'
    if (mode === "create") {
      if (formData.password && formData.password.length < 6) {
        newErrors.password = "Password minimal 6 karakter";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Password tidak cocok";
      }
    }

    if (formData.role === "siswa" && !formData.kelas) {
      newErrors.kelas = "Kelas harus dipilih";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast.error("Mohon periksa kembali form Anda.");
      return;
    }

    // Siapkan data untuk dikirim
    const submitData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      identifier: formData.identifier.trim(),
    };

    if (mode === "create" && formData.password) {
      submitData.password = formData.password;
    }

    if (formData.role === "siswa") {
      submitData.kelas = formData.kelas;
    }

    // Kirim role hanya saat create
    if (mode === "create") {
      onSubmit(submitData, formData.role);
    } else {
      onSubmit(submitData); // Saat edit, tidak perlu kirim role
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {mode === "create" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Select
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            error={errors.role}
            required
            options={[
              { value: "siswa", label: "Siswa" },
              { value: "guru", label: "Guru" },
            ]}
          />
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        className="space-y-6"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nama Lengkap"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
            />
          </div>
          <Input
            label={formData.role === "guru" ? "NIP" : "NISN"}
            name="identifier"
            value={formData.identifier}
            onChange={handleChange}
            error={errors.identifier}
            required
            disabled={mode === "edit"}
            helperText={mode === "edit" ? "Identifier tidak dapat diubah" : ""}
          />
        </div>

        {formData.role === "siswa" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Select
              label="Kelas"
              name="kelas"
              value={formData.kelas}
              onChange={handleChange}
              error={errors.kelas}
              required
              disabled={loadingKelas}
              placeholder={
                loadingKelas ? "Memuat data kelas..." : "Pilih Kelas"
              }
              options={kelasList.map((k) => ({
                value: k._id,
                label: `${k.nama} (${k.tahunAjaran})`,
              }))}
            />
          </motion.div>
        )}

        {/* ================================================================== */}
        {/* PERBAIKAN: Seluruh bagian password hanya muncul saat mode 'create' */}
        {/* ================================================================== */}
        {mode === "create" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div>
              <h3 className="text-lg font-semibold text-neutral-text pb-2 border-b">
                Password Awal (Opsional)
              </h3>
              <p className="text-sm text-neutral-secondary mt-2">
                Jika tidak diisi, password akan sama dengan NIP/NISN.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="Min. 6 karakter"
              />
              <Input
                label="Konfirmasi Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                placeholder="Ketik ulang password"
              />
            </div>
          </motion.div>
        )}
      </motion.div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Batal
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          {mode === "create" ? "Buat User" : "Simpan Perubahan"}
        </Button>
      </div>
    </form>
  );
}
