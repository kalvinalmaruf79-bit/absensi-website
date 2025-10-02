// src/components/super-admin/KelasForm.jsx
"use client";

import { useState, useEffect } from "react";
import { Save, X, Loader2 } from "lucide-react";

export default function KelasForm({
  initialData = null,
  onSubmit,
  onCancel,
  guruList = [],
  isLoading = false,
}) {
  const [formData, setFormData] = useState({
    nama: "",
    tingkat: "",
    jurusan: "",
    tahunAjaran: "",
    waliKelas: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      console.log("Initial data received:", initialData);
      setFormData({
        nama: initialData.nama || "",
        tingkat: initialData.tingkat || "",
        jurusan: initialData.jurusan || "",
        tahunAjaran: initialData.tahunAjaran || "",
        waliKelas: initialData.waliKelas?._id || initialData.waliKelas || "",
      });
    }
  }, [initialData]);

  const tingkatOptions = [
    { value: "X", label: "X (Sepuluh)" },
    { value: "XI", label: "XI (Sebelas)" },
    { value: "XII", label: "XII (Dua Belas)" },
  ];

  const jurusanOptions = [
    { value: "Akuntansi", label: "Akuntansi" },
    {
      value: "Teknik Komputer dan Jaringan",
      label: "TKJ - Teknik Komputer dan Jaringan",
    },
    {
      value: "Desain Komunikasi Visual",
      label: "DKV - Desain Komunikasi Visual",
    },
    { value: "Tata Busana", label: "Tata Busana" },
  ];

  const generateTahunAjaran = () => {
    const currentYear = new Date().getFullYear();
    const options = [];
    for (let i = -5; i <= 3; i++) {
      const year = currentYear + i;
      options.push({
        value: `${year}/${year + 1}`,
        label: `${year}/${year + 1}`,
      });
    }
    return options;
  };

  const tahunAjaranOptions = generateTahunAjaran();

  const [showCustomTahunAjaran, setShowCustomTahunAjaran] = useState(false);
  const [customTahunAjaran, setCustomTahunAjaran] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "tahunAjaran") {
      if (value === "custom") {
        setShowCustomTahunAjaran(true);
        setFormData((prev) => ({ ...prev, tahunAjaran: "" }));
      } else {
        setShowCustomTahunAjaran(false);
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCustomTahunAjaranChange = (e) => {
    const value = e.target.value;
    setCustomTahunAjaran(value);

    const regex = /^\d{4}\/\d{4}$/;
    if (regex.test(value)) {
      const [year1, year2] = value.split("/").map(Number);
      if (year2 === year1 + 1) {
        setFormData((prev) => ({ ...prev, tahunAjaran: value }));
        if (errors.tahunAjaran) {
          setErrors((prev) => ({ ...prev, tahunAjaran: "" }));
        }
      }
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.nama.trim()) {
      newErrors.nama = "Nama kelas harus diisi";
    }

    if (!formData.tingkat) {
      newErrors.tingkat = "Tingkat harus dipilih";
    }

    if (!formData.jurusan) {
      newErrors.jurusan = "Jurusan harus dipilih";
    }

    if (!formData.tahunAjaran) {
      newErrors.tahunAjaran = "Tahun ajaran harus dipilih";
    } else if (showCustomTahunAjaran) {
      const regex = /^\d{4}\/\d{4}$/;
      if (!regex.test(formData.tahunAjaran)) {
        newErrors.tahunAjaran =
          "Format tahun ajaran tidak valid (contoh: 2024/2025)";
      } else {
        const [year1, year2] = formData.tahunAjaran.split("/").map(Number);
        if (year2 !== year1 + 1) {
          newErrors.tahunAjaran =
            "Tahun kedua harus 1 tahun setelah tahun pertama";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nama Kelas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nama Kelas <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="nama"
          value={formData.nama}
          onChange={handleChange}
          placeholder="Contoh: X TKJ 1"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
            errors.nama ? "border-red-500" : "border-gray-300"
          }`}
          disabled={isLoading}
        />
        {errors.nama && (
          <p className="mt-1 text-sm text-red-600">{errors.nama}</p>
        )}
      </div>

      {/* Tingkat & Jurusan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tingkat <span className="text-red-500">*</span>
          </label>
          <select
            name="tingkat"
            value={formData.tingkat}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white ${
              errors.tingkat ? "border-red-500" : "border-gray-300"
            }`}
            disabled={isLoading}
          >
            <option value="">Pilih Tingkat</option>
            {tingkatOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.tingkat && (
            <p className="mt-1 text-sm text-red-600">{errors.tingkat}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Jurusan <span className="text-red-500">*</span>
          </label>
          <select
            name="jurusan"
            value={formData.jurusan}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white ${
              errors.jurusan ? "border-red-500" : "border-gray-300"
            }`}
            disabled={isLoading}
          >
            <option value="">Pilih Jurusan</option>
            {jurusanOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.jurusan && (
            <p className="mt-1 text-sm text-red-600">{errors.jurusan}</p>
          )}
        </div>
      </div>

      {/* Tahun Ajaran & Wali Kelas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tahun Ajaran <span className="text-red-500">*</span>
          </label>
          {!showCustomTahunAjaran ? (
            <>
              <select
                name="tahunAjaran"
                value={formData.tahunAjaran}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white ${
                  errors.tahunAjaran ? "border-red-500" : "border-gray-300"
                }`}
                disabled={isLoading}
              >
                <option value="">Pilih Tahun Ajaran</option>
                {tahunAjaranOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
                <option value="custom">+ Tahun Ajaran Lainnya</option>
              </select>
              {errors.tahunAjaran && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.tahunAjaran}
                </p>
              )}
            </>
          ) : (
            <>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTahunAjaran}
                  onChange={handleCustomTahunAjaranChange}
                  placeholder="Contoh: 2026/2027"
                  className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.tahunAjaran ? "border-red-500" : "border-gray-300"
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomTahunAjaran(false);
                    setCustomTahunAjaran("");
                    setFormData((prev) => ({ ...prev, tahunAjaran: "" }));
                  }}
                  className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isLoading}
                >
                  Batal
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Format: YYYY/YYYY (contoh: 2026/2027)
              </p>
              {errors.tahunAjaran && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.tahunAjaran}
                </p>
              )}
            </>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Wali Kelas
          </label>
          <select
            name="waliKelas"
            value={formData.waliKelas}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white"
            disabled={isLoading}
          >
            <option value="">Pilih Wali Kelas (Opsional)</option>
            {guruList.map((guru) => (
              <option key={guru._id} value={guru._id}>
                {guru.name} - {guru.identifier}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Wali kelas dapat ditentukan kemudian
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          disabled={isLoading}
        >
          <X className="w-5 h-5 inline mr-2" />
          Batal
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2.5 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 inline mr-2" />
              {initialData ? "Update Kelas" : "Simpan Kelas"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
