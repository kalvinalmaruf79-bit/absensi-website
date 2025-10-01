// src/components/super-admin/UserForm.jsx
"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { superAdminService } from "@/services/super-admin.service";
import { handleApiError } from "@/lib/api-helpers";

export default function UserForm({
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
  mode = "create", // "create" or "edit"
}) {
  const [formData, setFormData] = useState({
    role: initialData.role || "",
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
      const response = await superAdminService.getAllKelas({ isActive: true });

      // Handle different response structures
      let kelasData = [];
      if (Array.isArray(response)) {
        kelasData = response;
      } else if (response.data && Array.isArray(response.data)) {
        kelasData = response.data;
      }

      setKelasList(kelasData);
    } catch (err) {
      console.error("Error loading kelas:", err);
      const errorData = handleApiError(err);
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

    if (!formData.name || formData.name.trim() === "") {
      newErrors.name = "Nama harus diisi";
    } else if (formData.name.length < 3) {
      newErrors.name = "Nama minimal 3 karakter";
    }

    if (!formData.email) {
      newErrors.email = "Email harus diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!formData.identifier) {
      newErrors.identifier = `${
        formData.role === "guru" ? "NIP" : "NISN"
      } harus diisi`;
    } else if (formData.identifier.length < 5) {
      newErrors.identifier = `${
        formData.role === "guru" ? "NIP" : "NISN"
      } minimal 5 karakter`;
    }

    // Password validation only for create mode or if password is filled in edit mode
    if (mode === "create" || formData.password) {
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

    // Clear error for this field when user starts typing
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
      return;
    }

    // Prepare data for submission
    const submitData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      identifier: formData.identifier.trim(),
    };

    // Only include password if it's filled
    if (formData.password) {
      submitData.password = formData.password;
    }

    // Include kelas for siswa
    if (formData.role === "siswa") {
      submitData.kelas = formData.kelas;
    }

    onSubmit(submitData, formData.role);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Role Selection - Only show in create mode */}
      {mode === "create" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Select
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            error={errors.role}
            required
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            }
            options={[
              { value: "guru", label: "Guru" },
              { value: "siswa", label: "Siswa" },
            ]}
          />
        </motion.div>
      )}

      {/* Show form fields only when role is selected or in edit mode */}
      {(formData.role || mode === "edit") && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-text pb-2 border-b">
              Informasi Dasar
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nama Lengkap"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
                placeholder="Masukkan nama lengkap"
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                }
              />

              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
                placeholder="nama@email.com"
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                }
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
              placeholder={`Masukkan ${
                formData.role === "guru" ? "NIP" : "NISN"
              }`}
              helperText={
                mode === "edit" ? "Identifier tidak dapat diubah" : ""
              }
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                  />
                </svg>
              }
            />
          </div>

          {/* Class Selection for Siswa */}
          {formData.role === "siswa" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-neutral-text pb-2 border-b">
                Informasi Kelas
              </h3>

              <Select
                label="Kelas"
                name="kelas"
                value={formData.kelas}
                onChange={handleChange}
                error={errors.kelas}
                required
                disabled={loadingKelas}
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                }
                options={kelasList.map((k) => ({
                  value: k._id,
                  label: `${k.nama} - ${k.jurusan} (${k.tahunAjaran})`,
                }))}
              />

              {loadingKelas && (
                <p className="text-sm text-neutral-secondary">
                  Memuat data kelas...
                </p>
              )}

              {!loadingKelas && kelasList.length === 0 && (
                <p className="text-sm text-yellow-600">
                  Belum ada kelas yang tersedia. Silakan buat kelas terlebih
                  dahulu.
                </p>
              )}
            </motion.div>
          )}

          {/* Password Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-neutral-text pb-2 border-b">
                {mode === "create"
                  ? "Password (Opsional)"
                  : "Ubah Password (Opsional)"}
              </h3>
              <p className="text-sm text-neutral-secondary mt-2">
                {mode === "create"
                  ? "Jika tidak diisi, sistem akan generate password otomatis"
                  : "Kosongkan jika tidak ingin mengubah password"}
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
                helperText="Minimal 6 karakter"
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                }
              />

              <Input
                label="Konfirmasi Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                placeholder="Ketik ulang password"
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              />
            </div>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-end gap-3 pt-4 border-t"
          >
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              icon={
                mode === "create" ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )
              }
            >
              {mode === "create" ? "Buat User" : "Simpan Perubahan"}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </form>
  );
}
