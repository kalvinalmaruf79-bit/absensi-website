// 11. src/services/pengumuman.service.js
// ============================================
import axiosInstance from "@/lib/axios-instance";

export const pengumumanService = {
  /**
   * Create Pengumuman (Admin/Guru)
   * Body: {
   *   judul: string,
   *   isi: string,
   *   targetRole: 'guru'|'siswa'|'all',
   *   targetKelas?: string[] (array of kelas IDs, optional)
   * }
   */
  createPengumuman: async (data) => {
    const response = await axiosInstance.post("/pengumuman", data);
    return response.data;
  },

  /**
   * Get Pengumuman
   * Query: ?page=1&limit=10
   */
  getPengumuman: async (params) => {
    const response = await axiosInstance.get("/pengumuman", { params });
    return response.data;
  },
};
