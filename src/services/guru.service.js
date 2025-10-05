// src/services/guru.service.js
import axiosInstance from "@/lib/axios-instance";

export const guruService = {
  /**
   * Get Dashboard Data
   * GET /api/guru/dashboard
   */
  getDashboard: async () => {
    const response = await axiosInstance.get("/guru/dashboard");
    return response.data;
  },

  /**
   * Get Kelas yang Diampu oleh Guru
   * GET /api/guru/kelas
   * Returns: Array of kelas objects
   */
  getKelasDiampu: async () => {
    const response = await axiosInstance.get("/guru/kelas");
    return response.data;
  },

  /**
   * Get Mata Pelajaran yang Diampu oleh Guru
   * GET /api/guru/mata-pelajaran
   * Returns: Array of mata pelajaran objects
   */
  getMataPelajaranDiampu: async () => {
    const response = await axiosInstance.get("/guru/mata-pelajaran");
    return response.data;
  },

  /**
   * Get Jadwal Guru - Semua jadwal per hari
   * GET /api/guru/jadwal
   * Query: ?tahunAjaran=2024/2025&semester=ganjil
   * Returns: { senin: [], selasa: [], ... }
   */
  getJadwalGuru: async (params = {}) => {
    const response = await axiosInstance.get("/guru/jadwal", { params });
    return response.data;
  },

  /**
   * Get Jadwal Guru dengan Filter (Alias untuk getJadwalGuru)
   * Query: ?hari=senin&tahunAjaran=2024/2025&semester=ganjil
   */
  getJadwal: async (params) => {
    const response = await axiosInstance.get("/guru/jadwal", { params });
    return response.data;
  },

  /**
   * Get Siswa by Kelas
   * GET /api/guru/kelas/:kelasId/siswa
   * Params: kelasId (kelas ID)
   * Query: ?page=1&limit=100&search=nama
   */
  getSiswaKelas: async (kelasId, params = {}) => {
    const response = await axiosInstance.get(`/guru/kelas/${kelasId}/siswa`, {
      params,
    });
    return response.data;
  },

  /**
   * Get Rekap Nilai Kelas
   * GET /api/guru/kelas/:kelasId/rekap-nilai
   * Params: kelasId (kelas ID)
   * Query: ?mataPelajaranId=xxx&semester=ganjil&tahunAjaran=2024/2025&export=true
   */
  getRekapNilaiKelas: async (kelasId, params) => {
    const response = await axiosInstance.get(
      `/guru/kelas/${kelasId}/rekap-nilai`,
      { params }
    );
    return response.data;
  },

  /**
   * Get Absensi by Sesi
   * GET /api/guru/absensi/sesi
   * Query: ?kelasId=xxx&mataPelajaranId=xxx&tanggal=2024-01-01
   */
  getAbsensiBySesi: async (params) => {
    const response = await axiosInstance.get("/guru/absensi/sesi", { params });
    return response.data;
  },

  /**
   * Input Nilai Single
   * POST /api/guru/nilai
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
   * POST /api/guru/nilai/bulk
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
   * GET /api/guru/nilai
   * Query: ?kelasId=xxx&mataPelajaranId=xxx&semester=ganjil&tahunAjaran=2024/2025&page=1&limit=10
   */
  getNilaiSiswa: async (params) => {
    const response = await axiosInstance.get("/guru/nilai", { params });
    return response.data;
  },

  /**
   * Get Detail Nilai Siswa
   * GET /api/guru/nilai/siswa/:siswaId
   * Params: siswaId (siswa ID)
   */
  getDetailNilaiSiswa: async (siswaId) => {
    const response = await axiosInstance.get(`/guru/nilai/siswa/${siswaId}`);
    return response.data;
  },

  /**
   * Get Analisis Kinerja Siswa
   * GET /api/guru/analisis-kinerja
   * Query: ?siswaId=xxx&tahunAjaran=2024/2025&semester=ganjil
   */
  getAnalisisKinerja: async (params) => {
    const response = await axiosInstance.get("/guru/analisis-kinerja", {
      params,
    });
    return response.data;
  },

  /**
   * Get Histori Aktivitas Siswa
   * GET /api/guru/siswa/:siswaId/histori-aktivitas
   * Params: siswaId (siswa ID)
   * Query: ?page=1&limit=15
   */
  getHistoriAktivitasSiswa: async (siswaId, params = {}) => {
    const response = await axiosInstance.get(
      `/guru/siswa/${siswaId}/histori-aktivitas`,
      { params }
    );
    return response.data;
  },

  /**
   * Export Nilai
   * GET /api/guru/nilai/export
   * Query: ?kelasId=xxx&mataPelajaranId=xxx&semester=ganjil&tahunAjaran=2024/2025
   */
  exportNilai: async (params) => {
    const response = await axiosInstance.get("/guru/nilai/export", {
      params,
      responseType: "blob",
    });
    return response.data;
  },

  // ============= WALI KELAS FUNCTIONS =============

  /**
   * Get Siswa Perwalian (Wali Kelas)
   * GET /api/guru/wali-kelas/siswa
   */
  getSiswaWaliKelas: async () => {
    const response = await axiosInstance.get("/guru/wali-kelas/siswa");
    return response.data;
  },

  /**
   * Get Pengajuan Absensi (Wali Kelas)
   * GET /api/guru/wali-kelas/pengajuan-absensi
   * Query: ?status=pending|disetujui|ditolak&page=1&limit=10
   */
  getPengajuanAbsensi: async (params = {}) => {
    const response = await axiosInstance.get(
      "/guru/wali-kelas/pengajuan-absensi",
      { params }
    );
    return response.data;
  },

  /**
   * Review Pengajuan Absensi (Wali Kelas)
   * PUT /api/guru/wali-kelas/pengajuan-absensi/:id/review
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
