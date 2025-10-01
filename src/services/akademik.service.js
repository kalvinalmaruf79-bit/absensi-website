// 10. src/services/akademik.service.js
// ============================================
import axiosInstance from "@/lib/axios-instance";

export const akademikService = {
  /**
   * Generate Rapor Siswa (Guru/Admin)
   * Params: siswaId (siswa ID)
   * Query: ?tahunAjaran=2024/2025&semester=ganjil
   */
  generateRapor: async (siswaId, params) => {
    const response = await axiosInstance.get(`/akademik/rapor/${siswaId}`, {
      params,
    });
    return response.data;
  },

  /**
   * Generate Rapor Siswa Login (Siswa)
   * Query: ?tahunAjaran=2024/2025&semester=ganjil
   */
  generateRaporSaya: async (params) => {
    const response = await axiosInstance.get("/akademik/rapor-saya", {
      params,
    });
    return response.data;
  },

  /**
   * Generate Transkrip Siswa (Guru/Admin)
   * Params: siswaId (siswa ID)
   */
  generateTranskrip: async (siswaId) => {
    const response = await axiosInstance.get(`/akademik/transkrip/${siswaId}`);
    return response.data;
  },

  /**
   * Generate Transkrip Siswa Login (Siswa)
   */
  generateTranskripSaya: async () => {
    const response = await axiosInstance.get("/akademik/transkrip-saya");
    return response.data;
  },
};
