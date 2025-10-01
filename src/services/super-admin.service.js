// 3. src/services/super-admin.service.js
// ============================================
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
   *   namaSekolah?: string,
   *   semesterAktif?: 'ganjil' | 'genap',
   *   tahunAjaranAktif?: string
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
   *   name: string,
   *   email: string,
   *   identifier: string, // NIP
   *   password?: string
   * }
   */
  createGuru: async (data) => {
    const response = await axiosInstance.post("/super-admin/users/guru", data);
    return response.data;
  },

  /**
   * Create Siswa
   * Body: {
   *   name: string,
   *   email: string,
   *   identifier: string, // NISN
   *   kelas: string, // ID kelas
   *   password?: string
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
   * Update User
   * Params: id (user ID)
   * Body: {
   *   name?: string,
   *   email?: string,
   *   isActive?: boolean,
   *   kelas?: string (untuk siswa)
   * }
   */
  updateUser: async (id, data) => {
    const response = await axiosInstance.put(`/super-admin/users/${id}`, data);
    return response.data;
  },

  /**
   * Delete User
   * Params: id (user ID)
   */
  deleteUser: async (id) => {
    const response = await axiosInstance.delete(`/super-admin/users/${id}`);
    return response.data;
  },

  /**
   * Reset User Password
   * Params: id (user ID)
   * Body: {
   *   newPassword: string
   * }
   */
  resetPassword: async (id, newPassword) => {
    const response = await axiosInstance.put(
      `/super-admin/users/${id}/reset-password`,
      { newPassword }
    );
    return response.data;
  },

  // === MATA PELAJARAN MANAGEMENT ===

  /**
   * Create Mata Pelajaran
   * Body: {
   *   nama: string,
   *   kode: string,
   *   deskripsi?: string
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
   * Query: ?isActive=true
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
   *   nama?: string,
   *   kode?: string,
   *   deskripsi?: string,
   *   isActive?: boolean
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
   * Delete Mata Pelajaran
   * Params: id (mata pelajaran ID)
   */
  deleteMataPelajaran: async (id) => {
    const response = await axiosInstance.delete(
      `/super-admin/mata-pelajaran/${id}`
    );
    return response.data;
  },

  /**
   * Assign Guru to Mata Pelajaran
   * Body: {
   *   mataPelajaranId: string,
   *   guruId: string
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
   *   mataPelajaranId: string,
   *   guruId: string
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
   * Create Kelas
   * Body: {
   *   nama: string,
   *   tingkat: string,
   *   jurusan: string,
   *   tahunAjaran: string,
   *   waliKelas: string // ID guru
   * }
   */
  createKelas: async (data) => {
    const response = await axiosInstance.post("/super-admin/kelas", data);
    return response.data;
  },

  /**
   * Get All Kelas
   * Query: ?tahunAjaran=2024/2025&tingkat=X
   */
  getAllKelas: async (params) => {
    const response = await axiosInstance.get("/super-admin/kelas", { params });
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
   * Update Kelas
   * Params: id (kelas ID)
   * Body: {
   *   nama?: string,
   *   waliKelas?: string,
   *   isActive?: boolean
   * }
   */
  updateKelas: async (id, data) => {
    const response = await axiosInstance.put(`/super-admin/kelas/${id}`, data);
    return response.data;
  },

  /**
   * Delete Kelas
   * Params: id (kelas ID)
   */
  deleteKelas: async (id) => {
    const response = await axiosInstance.delete(`/super-admin/kelas/${id}`);
    return response.data;
  },

  // === JADWAL MANAGEMENT ===

  /**
   * Create Jadwal
   * Body: {
   *   kelas: string, // ID kelas
   *   mataPelajaran: string, // ID mata pelajaran
   *   guru: string, // ID guru
   *   hari: 'senin'|'selasa'|'rabu'|'kamis'|'jumat'|'sabtu',
   *   jamMulai: string, // "08:00"
   *   jamSelesai: string, // "10:30"
   *   semester: 'ganjil'|'genap',
   *   tahunAjaran: string
   * }
   */
  createJadwal: async (data) => {
    const response = await axiosInstance.post("/super-admin/jadwal", data);
    return response.data;
  },

  /**
   * Get All Jadwal
   * Query: ?kelasId=xxx&guruId=xxx&hari=senin&semester=ganjil&tahunAjaran=2024/2025
   */
  getAllJadwal: async (params) => {
    const response = await axiosInstance.get("/super-admin/jadwal", { params });
    return response.data;
  },

  /**
   * Update Jadwal
   * Params: id (jadwal ID)
   * Body: sama seperti create jadwal
   */
  updateJadwal: async (id, data) => {
    const response = await axiosInstance.put(`/super-admin/jadwal/${id}`, data);
    return response.data;
  },

  /**
   * Delete Jadwal
   * Params: id (jadwal ID)
   */
  deleteJadwal: async (id) => {
    const response = await axiosInstance.delete(`/super-admin/jadwal/${id}`);
    return response.data;
  },

  // === ACADEMIC CYCLE ===

  /**
   * Get Promotion Recommendation
   * Query: ?tahunAjaran=2024/2025&semester=genap
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
   *   fromKelasId: string,
   *   tahunAjaran: string,
   *   semester: string,
   *   siswaData: [{
   *     siswaId: string,
   *     status: 'Naik Kelas' | 'Tinggal Kelas' | 'Lulus',
   *     toKelasId?: string
   *   }]
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
