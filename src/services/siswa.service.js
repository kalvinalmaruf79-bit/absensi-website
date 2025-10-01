// 5. src/services/siswa.service.js
// ============================================
import axiosInstance from "@/lib/axios-instance";

export const siswaService = {
  /**
   * Get Dashboard Data
   */
  getDashboard: async () => {
    const response = await axiosInstance.get("/siswa/dashboard");
    return response.data;
  },

  /**
   * Get Histori Aktivitas
   * Query: ?page=1&limit=20
   */
  getHistoriAktivitas: async (params) => {
    const response = await axiosInstance.get("/siswa/histori-aktivitas", {
      params,
    });
    return response.data;
  },

  /**
   * Get Jadwal Siswa
   * Query: ?hari=senin&tahunAjaran=2024/2025&semester=ganjil
   */
  getJadwal: async (params) => {
    const response = await axiosInstance.get("/siswa/jadwal", { params });
    return response.data;
  },

  /**
   * Get Jadwal Mendatang
   */
  getJadwalMendatang: async () => {
    const response = await axiosInstance.get("/siswa/jadwal/mendatang");
    return response.data;
  },

  /**
   * Get Jadwal by Tanggal
   * Query: ?tanggal=YYYY-MM-DD
   */
  getJadwalByTanggal: async (params) => {
    const response = await axiosInstance.get("/siswa/jadwal-by-tanggal", {
      params,
    });
    return response.data;
  },

  /**
   * Get Tugas Mendatang
   */
  getTugasMendatang: async () => {
    const response = await axiosInstance.get("/siswa/tugas/mendatang");
    return response.data;
  },

  /**
   * Get Nilai Siswa
   * Query: ?tahunAjaran=2024/2025&semester=ganjil&mataPelajaranId=xxx
   */
  getNilai: async (params) => {
    const response = await axiosInstance.get("/siswa/nilai", { params });
    return response.data;
  },

  /**
   * Get Riwayat Presensi
   * Query: ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&mataPelajaranId=xxx
   */
  getRiwayatPresensi: async (params) => {
    const response = await axiosInstance.get("/siswa/presensi", { params });
    return response.data;
  },

  /**
   * Get Teman Sekelas
   */
  getTemanSekelas: async () => {
    const response = await axiosInstance.get("/siswa/teman-sekelas");
    return response.data;
  },

  /**
   * Get Notifikasi
   * Query: ?page=1&limit=20&isRead=false
   */
  getNotifikasi: async (params) => {
    const response = await axiosInstance.get("/siswa/notifikasi", { params });
    return response.data;
  },

  /**
   * Mark Notifikasi as Read
   * Params: id (notifikasi ID)
   */
  markNotifikasiAsRead: async (id) => {
    const response = await axiosInstance.patch(`/siswa/notifikasi/${id}/read`);
    return response.data;
  },
};
