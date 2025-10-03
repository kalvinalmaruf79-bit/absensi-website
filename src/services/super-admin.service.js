// src\services\super-admin.service.js
import axiosInstance from "@/lib/axios-instance";

export const superAdminService = {
  /**
   * Get Dashboard Data
   */
  getDashboard: async () => {
    const response = await axiosInstance.get("/super-admin/dashboard");
    return response.data;
  },

  /**
   * Get Settings
   */
  getSettings: async () => {
    const response = await axiosInstance.get("/super-admin/settings");
    return response.data;
  },

  /**
   * Update Settings
   * Body: {
   * namaSekolah?: string,
   * semesterAktif?: 'ganjil' | 'genap',
   * tahunAjaranAktif?: string
   * }
   */
  updateSettings: async (settings) => {
    const response = await axiosInstance.put("/super-admin/settings", settings);
    return response.data;
  },

  /**
   * Get Activity Report
   * Query: ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
   */
  getActivityReport: async (params) => {
    const response = await axiosInstance.get("/super-admin/reports/activity", {
      params,
    });
    return response.data;
  },

  // === USER MANAGEMENT ===

  /**
   * Create Guru
   * Body: {
   * name: string,
   * email: string,
   * identifier: string, // NIP
   * password?: string
   * }
   */
  createGuru: async (data) => {
    const response = await axiosInstance.post("/super-admin/users/guru", data);
    return response.data;
  },

  /**
   * Create Siswa
   * Body: {
   * name: string,
   * email: string,
   * identifier: string, // NISN
   * kelas: string, // ID kelas
   * password?: string
   * }
   */
  createSiswa: async (data) => {
    const response = await axiosInstance.post("/super-admin/users/siswa", data);
    return response.data;
  },

  /**
   * Import Users (Excel)
   * Body: FormData dengan field 'file' (Excel file)
   */
  importUsers: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axiosInstance.post(
      "/super-admin/users/import",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  },

  /**
   * Get All Users
   * Query: ?role=guru|siswa&search=keyword&page=1&limit=10
   */
  getAllUsers: async (params) => {
    const response = await axiosInstance.get("/super-admin/users", { params });
    return response.data;
  },

  /**
   * Get User By ID
   * Params: id (user ID)
   */
  getUserById: async (id) => {
    const response = await axiosInstance.get(`/super-admin/users/${id}`);
    return response.data;
  },

  /**
   * Get User Stats - Detail info dan data terkait sebelum delete
   * Params: id (user ID)
   * Response: {
   *   user: {...},
   *   stats: {
   *     // Untuk Guru:
   *     mataPelajaran: number,
   *     jadwal: number,
   *     materi: number,
   *     tugas: number,
   *     nilai: number,
   *     sesiPresensi: number
   *     // Atau untuk Siswa:
   *     kelas: number,
   *     nilai: number,
   *     absensi: number,
   *     tugas: number,
   *     riwayatKelas: number
   *   },
   *   totalRelasi: number,
   *   canSafeDelete: boolean,
   *   recommendation: string
   * }
   */
  getUserStats: async (id) => {
    const response = await axiosInstance.get(`/super-admin/users/${id}/stats`);
    return response.data;
  },

  /**
   * Update User
   * Params: id (user ID)
   * Body: {
   * name?: string,
   * email?: string,
   * isActive?: boolean,
   * kelas?: string (untuk siswa)
   * }
   */
  updateUser: async (id, data) => {
    const response = await axiosInstance.put(`/super-admin/users/${id}`, data);
    return response.data;
  },

  /**
   * Soft Delete User - Nonaktifkan user
   * Data tetap tersimpan dan dapat di-restore
   * Params: id (user ID)
   */
  deleteUser: async (id) => {
    const response = await axiosInstance.delete(`/super-admin/users/${id}`);
    return response.data;
  },

  /**
   * Force Delete User - Hapus permanen dengan 2 step confirmation
   * Step 1: Tanpa confirmed parameter - akan menampilkan warning
   * Step 2: Dengan confirmed=true - akan menghapus permanen
   *
   * Params: id (user ID)
   * Params: confirmed (boolean) - true untuk konfirmasi penghapusan
   * Query: ?confirm=yes untuk konfirmasi final
   *
   * PERHATIAN: Akan menghapus semua data terkait:
   * - Untuk Guru: Jadwal, Materi, Tugas, Nilai, Sesi Presensi
   * - Untuk Siswa: Nilai, Absensi, Submissions Tugas
   * - Activity Logs terkait user
   */
  forceDeleteUser: async (id, confirmed = false) => {
    const url = confirmed
      ? `/super-admin/users/${id}/force?confirm=yes`
      : `/super-admin/users/${id}/force`;
    const response = await axiosInstance.delete(url);
    return response.data;
  },

  /**
   * Restore User - Aktifkan kembali user yang di-soft delete
   * Params: id (user ID)
   *
   * Validasi:
   * - Untuk Siswa: Kelas harus masih aktif
   * - Untuk Guru: Mata pelajaran yang diampu harus masih aktif
   */
  restoreUser: async (id) => {
    const response = await axiosInstance.put(
      `/super-admin/users/${id}/restore`
    );
    return response.data;
  },

  /**
   * Reset User Password to their identifier (NISN/NIP)
   * Params: id (user ID)
   */
  resetPassword: async (id) => {
    const response = await axiosInstance.put(
      `/super-admin/users/${id}/reset-password`
    );
    return response.data;
  },

  // === MATA PELAJARAN MANAGEMENT ===

  /**
   * Create Mata Pelajaran
   * Body: {
   * nama: string,
   * kode: string,
   * deskripsi?: string
   * }
   */
  createMataPelajaran: async (data) => {
    const response = await axiosInstance.post(
      "/super-admin/mata-pelajaran",
      data
    );
    return response.data;
  },

  /**
   * Get All Mata Pelajaran
   * Query: ?isActive=true&search=keyword&page=1&limit=10
   */
  getAllMataPelajaran: async (params) => {
    const response = await axiosInstance.get("/super-admin/mata-pelajaran", {
      params,
    });
    return response.data;
  },

  /**
   * Get Mata Pelajaran By ID
   * Params: id (mata pelajaran ID)
   */
  getMataPelajaranById: async (id) => {
    const response = await axiosInstance.get(
      `/super-admin/mata-pelajaran/${id}`
    );
    return response.data;
  },

  /**
   * Update Mata Pelajaran
   * Params: id (mata pelajaran ID)
   * Body: {
   * nama?: string,
   * kode?: string,
   * deskripsi?: string,
   * isActive?: boolean
   * }
   */
  updateMataPelajaran: async (id, data) => {
    const response = await axiosInstance.put(
      `/super-admin/mata-pelajaran/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete Mata Pelajaran (Soft Delete)
   * Params: id (mata pelajaran ID)
   */
  deleteMataPelajaran: async (id) => {
    const response = await axiosInstance.delete(
      `/super-admin/mata-pelajaran/${id}`
    );
    return response.data;
  },

  /**
   * Get Mata Pelajaran Stats - Detail info sebelum delete
   * Params: id (mata pelajaran ID)
   */
  getMataPelajaranStats: async (id) => {
    const response = await axiosInstance.get(
      `/super-admin/mata-pelajaran/${id}/stats`
    );
    return response.data;
  },

  /**
   * Force Delete Mata Pelajaran - Hapus permanen
   * Params: id (mata pelajaran ID)
   * Query: ?confirm=yes untuk konfirmasi final
   */
  forceDeleteMataPelajaran: async (id, confirmed = false) => {
    const url = confirmed
      ? `/super-admin/mata-pelajaran/${id}/force?confirm=yes`
      : `/super-admin/mata-pelajaran/${id}/force`;
    const response = await axiosInstance.delete(url);
    return response.data;
  },

  /**
   * Restore Mata Pelajaran - Aktifkan kembali mata pelajaran yang di-soft delete
   * Params: id (mata pelajaran ID)
   */
  restoreMataPelajaran: async (id) => {
    const response = await axiosInstance.put(
      `/super-admin/mata-pelajaran/${id}/restore`
    );
    return response.data;
  },

  /**
   * Assign Guru to Mata Pelajaran
   * Body: {
   * mataPelajaranId: string,
   * guruId: string
   * }
   */
  assignGuruMataPelajaran: async (data) => {
    const response = await axiosInstance.put(
      "/super-admin/mata-pelajaran/assign-guru",
      data
    );
    return response.data;
  },

  /**
   * Unassign Guru from Mata Pelajaran
   * Body: {
   * mataPelajaranId: string,
   * guruId: string
   * }
   */
  unassignGuruMataPelajaran: async (data) => {
    const response = await axiosInstance.put(
      "/super-admin/mata-pelajaran/unassign-guru",
      data
    );
    return response.data;
  },

  // === KELAS MANAGEMENT ===

  /**
   * Get All Kelas
   * Query: ?isActive=true&search=keyword&page=1&limit=10
   */
  getAllKelas: async (params) => {
    const response = await axiosInstance.get("/super-admin/kelas", { params });
    return response.data;
  },

  /**
   * Get Kelas Stats - Detail info sebelum delete
   * Params: id (kelas ID)
   */
  getKelasStats: async (id) => {
    const response = await axiosInstance.get(`/super-admin/kelas/${id}/stats`);
    return response.data;
  },

  /**
   * Get Kelas By ID
   * Params: id (kelas ID)
   */
  getKelasById: async (id) => {
    const response = await axiosInstance.get(`/super-admin/kelas/${id}`);
    return response.data;
  },

  /**
   * Create Kelas
   * Body: {
   * nama: string,
   * tingkat: string,
   * jurusan: string,
   * tahunAjaran: string,
   * waliKelas: string // ID guru
   * }
   */
  createKelas: async (data) => {
    const response = await axiosInstance.post("/super-admin/kelas", data);
    return response.data;
  },

  /**
   * Update Kelas
   * Params: id (kelas ID)
   * Body: {
   * nama?: string,
   * tingkat?: string,
   * jurusan?: string,
   * tahunAjaran?: string,
   * waliKelas?: string,
   * isActive?: boolean
   * }
   */
  updateKelas: async (id, data) => {
    const response = await axiosInstance.put(`/super-admin/kelas/${id}`, data);
    return response.data;
  },

  /**
   * Soft Delete Kelas - Nonaktifkan kelas
   * Params: id (kelas ID)
   */
  deleteKelas: async (id) => {
    const response = await axiosInstance.delete(`/super-admin/kelas/${id}`);
    return response.data;
  },

  /**
   * Force Delete Kelas - Hapus permanen
   * Params: id (kelas ID)
   * Query: ?confirm=yes untuk konfirmasi final
   */
  forceDeleteKelas: async (id, confirmed = false) => {
    const url = confirmed
      ? `/super-admin/kelas/${id}/force?confirm=yes`
      : `/super-admin/kelas/${id}/force`;
    const response = await axiosInstance.delete(url);
    return response.data;
  },

  /**
   * Restore Kelas - Aktifkan kembali kelas yang di-soft delete
   * Params: id (kelas ID)
   */
  restoreKelas: async (id) => {
    const response = await axiosInstance.put(
      `/super-admin/kelas/${id}/restore`
    );
    return response.data;
  },

  // === JADWAL MANAGEMENT (ENHANCED) ===

  /**
   * Create Jadwal
   * Mendukung continuous scheduling (jadwal berurutan seperti 12:35-13:10, 13:10-14:00)
   * Body: {
   * kelas: string, // ID kelas
   * mataPelajaran: string, // ID mata pelajaran
   * guru: string, // ID guru
   * hari: 'senin'|'selasa'|'rabu'|'kamis'|'jumat'|'sabtu',
   * jamMulai: string, // Format: "08:00" atau "12:35"
   * jamSelesai: string, // Format: "10:30" atau "13:10"
   * semester: 'ganjil'|'genap',
   * tahunAjaran: string // Format: "2024/2025"
   * }
   */
  createJadwal: async (data) => {
    const response = await axiosInstance.post("/super-admin/jadwal", data);
    return response.data;
  },

  /**
   * Get All Jadwal with Filtering
   * Query:
   * - isActive: true/false (filter by status)
   * - kelasId: string (filter by kelas)
   * - guruId: string (filter by guru)
   * - hari: senin|selasa|rabu|kamis|jumat|sabtu (filter by hari)
   * - semester: ganjil|genap (filter by semester)
   * - tahunAjaran: string (filter by tahun ajaran, e.g., "2024/2025")
   * - page: number (default: 1)
   * - limit: number (default: 10)
   */
  getAllJadwal: async (params) => {
    const response = await axiosInstance.get("/super-admin/jadwal", {
      params,
    });
    return response.data;
  },

  /**
   * Get Jadwal Stats - Detail info dan data terkait sebelum delete
   * Params: id (jadwal ID)
   * Response: {
   * jadwal: {...},
   * stats: {
   * absensi: number,
   * sesiPresensi: number,
   * nilai: number,
   * tugas: number,
   * materi: number
   * },
   * totalRelasi: number,
   * canSafeDelete: boolean,
   * recommendation: string
   * }
   */
  getJadwalStats: async (id) => {
    const response = await axiosInstance.get(`/super-admin/jadwal/${id}/stats`);
    return response.data;
  },

  /**
   * Update Jadwal
   * Params: id (jadwal ID)
   * Body: {
   * kelas?: string,
   * mataPelajaran?: string,
   * guru?: string,
   * hari?: string,
   * jamMulai?: string,
   * jamSelesai?: string,
   * semester?: string,
   * tahunAjaran?: string,
   * isActive?: boolean
   * }
   */
  updateJadwal: async (id, data) => {
    const response = await axiosInstance.put(`/super-admin/jadwal/${id}`, data);
    return response.data;
  },

  /**
   * Soft Delete Jadwal - Nonaktifkan jadwal
   * Data tetap tersimpan dan dapat di-restore
   * Params: id (jadwal ID)
   */
  deleteJadwal: async (id) => {
    const response = await axiosInstance.delete(`/super-admin/jadwal/${id}`);
    return response.data;
  },

  /**
   * Force Delete Jadwal - Hapus permanen dengan 2 step confirmation
   * Step 1: Tanpa confirmed parameter - akan menampilkan warning
   * Step 2: Dengan confirmed=true - akan menghapus permanen
   *
   * Params: id (jadwal ID)
   * Params: confirmed (boolean) - true untuk konfirmasi penghapusan
   * Query: ?confirm=yes untuk konfirmasi final
   *
   * PERHATIAN: Akan menghapus semua data terkait:
   * - Absensi
   * - Sesi Presensi
   * - Nilai
   * - Tugas
   * - Materi
   */
  forceDeleteJadwal: async (id, confirmed = false) => {
    const url = confirmed
      ? `/super-admin/jadwal/${id}/force?confirm=yes`
      : `/super-admin/jadwal/${id}/force`;
    const response = await axiosInstance.delete(url);
    return response.data;
  },

  /**
   * Restore Jadwal - Aktifkan kembali jadwal yang di-soft delete
   * Params: id (jadwal ID)
   *
   * Validasi:
   * - Kelas, guru, dan mata pelajaran harus masih aktif
   * - Tidak ada bentrok dengan jadwal aktif lainnya
   * - Jadwal berurutan (continuous) tetap diperbolehkan
   */
  restoreJadwal: async (id) => {
    const response = await axiosInstance.put(
      `/super-admin/jadwal/${id}/restore`
    );
    return response.data;
  },

  // === ACADEMIC CYCLE ===

  /**
   * Get Promotion Recommendation
   * Query: ?kelasId=xxx&tahunAjaran=2024/2025
   */
  getPromotionRecommendation: async (params) => {
    const response = await axiosInstance.get(
      "/super-admin/academic/promotion-recommendation",
      { params }
    );
    return response.data;
  },

  /**
   * Process Promotion (Kenaikan Kelas)
   * Body: {
   * fromKelasId: string,
   * defaultToKelasId?: string,
   * tahunAjaran: string,
   * semester: string,
   * siswaData: [{
   * siswaId: string,
   * status: 'Naik Kelas' | 'Tinggal Kelas' | 'Lulus',
   * toKelasId?: string
   * }]
   * }
   */
  processPromotion: async (data) => {
    const response = await axiosInstance.post(
      "/super-admin/academic/promote",
      data
    );
    return response.data;
  },
};
