// 4. src/services/guru.service.js
// ============================================
import axiosInstance from "@/lib/axios-instance";

export const guruService = {
  /**
   * Get Dashboard Data
   */
  getDashboard: async () => {
    const response = await axiosInstance.get("/guru/dashboard");
    return response.data;
  },

  /**
   * Get Jadwal Guru
   * Query: ?hari=senin&tahunAjaran=2024/2025&semester=ganjil
   */
  getJadwal: async (params) => {
    const response = await axiosInstance.get("/guru/jadwal", { params });
    return response.data;
  },

  /**
   * Get Siswa by Kelas
   * Params: kelasId (kelas ID)
   */
  getSiswaKelas: async (kelasId) => {
    const response = await axiosInstance.get(`/guru/kelas/${kelasId}/siswa`);
    return response.data;
  },

  /**
   * Get Rekap Nilai Kelas
   * Params: kelasId (kelas ID)
   * Query: ?mataPelajaranId=xxx&semester=ganjil&tahunAjaran=2024/2025
   */
  getRekapNilaiKelas: async (kelasId, params) => {
    const response = await axiosInstance.get(
      `/guru/kelas/${kelasId}/rekap-nilai`,
      { params }
    );
    return response.data;
  },

  /**
   * Input Nilai Single
   * Body: {
   *   siswaId: string,
   *   mataPelajaranId: string,
   *   kelasId: string,
   *   jenisPenilaian: 'tugas'|'uts'|'uas'|'praktik'|'harian',
   *   nilai: number,
   *   semester: 'ganjil'|'genap',
   *   tahunAjaran: string,
   *   deskripsi?: string
   * }
   */
  inputNilai: async (data) => {
    const response = await axiosInstance.post("/guru/nilai", data);
    return response.data;
  },

  /**
   * Input Nilai Massal
   * Body: {
   *   kelasId: string,
   *   mataPelajaranId: string,
   *   jenisPenilaian: 'tugas'|'uts'|'uas'|'praktik'|'harian',
   *   semester: 'ganjil'|'genap',
   *   tahunAjaran: string,
   *   nilaiSiswa: [{
   *     siswaId: string,
   *     nilai: number,
   *     deskripsi?: string
   *   }]
   * }
   */
  inputNilaiMassal: async (data) => {
    const response = await axiosInstance.post("/guru/nilai/bulk", data);
    return response.data;
  },

  /**
   * Get Nilai Siswa
   * Query: ?kelasId=xxx&mataPelajaranId=xxx&semester=ganjil&tahunAjaran=2024/2025
   */
  getNilaiSiswa: async (params) => {
    const response = await axiosInstance.get("/guru/nilai", { params });
    return response.data;
  },

  /**
   * Get Detail Nilai Siswa
   * Params: siswaId (siswa ID)
   * Query: ?mataPelajaranId=xxx&semester=ganjil&tahunAjaran=2024/2025
   */
  getDetailNilaiSiswa: async (siswaId, params) => {
    const response = await axiosInstance.get(`/guru/nilai/siswa/${siswaId}`, {
      params,
    });
    return response.data;
  },

  /**
   * Get Analisis Kinerja Siswa
   * Query: ?siswaId=xxx&tahunAjaran=2024/2025&semester=ganjil
   */
  getAnalisisKinerja: async (params) => {
    const response = await axiosInstance.get("/guru/analisis-kinerja", {
      params,
    });
    return response.data;
  },

  /**
   * Export Nilai
   * Query: ?kelasId=xxx&mataPelajaranId=xxx&semester=ganjil&tahunAjaran=2024/2025&format=excel|pdf
   */
  exportNilai: async (params) => {
    const response = await axiosInstance.get("/guru/nilai/export", {
      params,
      responseType: "blob",
    });
    return response.data;
  },

  // === WALI KELAS FUNCTIONS ===

  /**
   * Get Siswa Perwalian (Wali Kelas)
   */
  getSiswaWaliKelas: async () => {
    const response = await axiosInstance.get("/guru/wali-kelas/siswa");
    return response.data;
  },

  /**
   * Get Pengajuan Absensi (Wali Kelas)
   * Query: ?status=pending|disetujui|ditolak
   */
  getPengajuanAbsensi: async (params) => {
    const response = await axiosInstance.get(
      "/guru/wali-kelas/pengajuan-absensi",
      { params }
    );
    return response.data;
  },

  /**
   * Review Pengajuan Absensi (Wali Kelas)
   * Params: id (pengajuan ID)
   * Body: {
   *   status: 'disetujui' | 'ditolak',
   *   catatan?: string
   * }
   */
  reviewPengajuanAbsensi: async (id, data) => {
    const response = await axiosInstance.put(
      `/guru/wali-kelas/pengajuan-absensi/${id}/review`,
      data
    );
    return response.data;
  },
};
