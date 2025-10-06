// src/services/qr.service.js
import axiosInstance from "@/lib/axios-instance";

export const qrService = {
  /**
   * Generate QR Code untuk Presensi (Guru)
   * Body: {
   *   jadwalId: string,
   *   latitude: number,
   *   longitude: number
   * }
   */
  generateQR: async (data) => {
    const response = await axiosInstance.post("/qr/generate", data);
    return response.data;
  },

  /**
   * Check Active Sessions (Guru)
   * Mendapatkan semua sesi aktif hari ini
   */
  checkActiveSessions: async () => {
    const response = await axiosInstance.get("/qr/check-active");
    return response.data;
  },
};
