// src/services/absensi.service.js (Updated)
import axiosInstance from "@/lib/axios-instance";

export const absensiService = {
  /**
   * Check-in Presensi (Siswa)
   * Body: {
   *   kodeSesi: string,
   *   latitude: number,
   *   longitude: number
   * }
   */
  checkIn: async (data) => {
    const response = await axiosInstance.post("/absensi/check-in", data);
    return response.data;
  },

  /**
   * Create Pengajuan Izin/Sakit
   * Body: FormData dengan fields:
   *   - tanggal: YYYY-MM-DD
   *   - keterangan: 'izin' | 'sakit'
   *   - alasan: string
   *   - fileBukti: File (optional)
   *   - jadwalIds: JSON string array ["id1", "id2"]
   */
  createPengajuan: async (formData) => {
    const response = await axiosInstance.post("/absensi/pengajuan", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  /**
   * Get Riwayat Pengajuan Siswa
   * Query: ?status=pending|disetujui|ditolak
   */
  getRiwayatPengajuan: async (params) => {
    const response = await axiosInstance.get(
      "/absensi/pengajuan/riwayat-saya",
      { params }
    );
    return response.data;
  },

  /**
   * Get All Pengajuan (Guru/Admin)
   * Query: ?status=pending&kelasId=xxx
   */
  getAllPengajuan: async (params) => {
    const response = await axiosInstance.get("/absensi/pengajuan", { params });
    return response.data;
  },

  /**
   * Review Pengajuan (Guru/Admin)
   * Params: id (pengajuan ID)
   * Body: {
   *   status: 'disetujui' | 'ditolak',
   *   catatan?: string
   * }
   */
  reviewPengajuan: async (id, data) => {
    const response = await axiosInstance.put(
      `/absensi/pengajuan/${id}/review`,
      data
    );
    return response.data;
  },

  /**
   * Get Riwayat Absensi (Guru/Admin)
   * Query: ?kelasId=xxx&mataPelajaranId=xxx&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
   */
  getRiwayatAbsensi: async (params) => {
    const response = await axiosInstance.get("/absensi/riwayat", { params });
    return response.data;
  },

  /**
   * Update Keterangan Presensi (Guru/Admin)
   * Params: id (absensi ID)
   * Body: {
   *   keterangan: 'hadir'|'izin'|'sakit'|'alpa'
   * }
   */
  updateKeterangan: async (id, keterangan) => {
    const response = await axiosInstance.put(`/absensi/${id}`, { keterangan });
    return response.data;
  },

  /**
   * Create Manual Absensi (Guru/Admin) - BARU
   * Body: {
   *   siswaId: string,
   *   jadwalId: string,
   *   keterangan: 'hadir'|'izin'|'sakit'|'alpa',
   *   tanggal: 'YYYY-MM-DD'
   * }
   */
  createManualAbsensi: async (data) => {
    const response = await axiosInstance.post("/absensi/manual", data);
    return response.data;
  },

  /**
   * Export Absensi (Guru/Admin)
   * Query: ?kelasId=xxx&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&format=excel|pdf
   */
  exportAbsensi: async (params) => {
    const response = await axiosInstance.get("/absensi/export", {
      params,
      responseType: "blob",
    });
    return response.data;
  },
};
