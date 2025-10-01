// 12. src/services/common.service.js
// ============================================
import axiosInstance from "@/lib/axios-instance";

export const commonService = {
  /**
   * Get All Mata Pelajaran (Dropdown)
   */
  getMataPelajaran: async () => {
    const response = await axiosInstance.get("/common/mata-pelajaran");
    return response.data;
  },

  /**
   * Get All Kelas (Dropdown)
   */
  getKelas: async () => {
    const response = await axiosInstance.get("/common/kelas");
    return response.data;
  },
};
