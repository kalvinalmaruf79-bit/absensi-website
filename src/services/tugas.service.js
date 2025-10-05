// src/services/tugas.service.js
import axiosInstance from "@/lib/axios-instance";

export const tugasService = {
  /**
   * Create Tugas (Guru)
   * Body: {
   *   judul: string,
   *   deskripsi: string,
   *   mataPelajaran: string (ID),
   *   kelas: string (ID),
   *   deadline: string (ISO date),
   *   semester: 'ganjil'|'genap',
   *   tahunAjaran: string
   * }
   */
  createTugas: async (data) => {
    const response = await axiosInstance.post("/tugas", data);
    return response.data;
  },

  /**
   * Get Tugas by Kelas
   * Query: ?kelasId=xxx&mataPelajaranId=xxx
   */
  getTugasByKelas: async (params) => {
    const response = await axiosInstance.get("/tugas", { params });
    return response.data;
  },

  /**
   * Get Single Tugas by ID
   * Params: id (tugas ID)
   */
  getTugasById: async (id) => {
    const response = await axiosInstance.get(`/tugas/${id}`);
    return response.data;
  },

  /**
   * Update Tugas (Guru)
   * Params: id (tugas ID)
   * Body: {
   *   judul?: string,
   *   deskripsi?: string,
   *   mataPelajaran?: string (ID),
   *   kelas?: string (ID),
   *   deadline?: string (ISO date),
   *   semester?: 'ganjil'|'genap',
   *   tahunAjaran?: string
   * }
   */
  updateTugas: async (id, data) => {
    const response = await axiosInstance.put(`/tugas/${id}`, data);
    return response.data;
  },

  /**
   * Delete Tugas (Guru)
   * Params: id (tugas ID)
   */
  deleteTugas: async (id) => {
    const response = await axiosInstance.delete(`/tugas/${id}`);
    return response.data;
  },

  /**
   * Submit Tugas (Siswa)
   * Params: id (tugas ID)
   * Body: FormData dengan field 'file' (File)
   */
  submitTugas: async (id, file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axiosInstance.post(`/tugas/${id}/submit`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  /**
   * Get Tugas Submissions (Guru)
   * Params: tugasId (tugas ID)
   */
  getTugasSubmissions: async (tugasId) => {
    const response = await axiosInstance.get(`/tugas/${tugasId}/submissions`);
    return response.data;
  },

  /**
   * Grade Submission (Guru)
   * Params: submissionId (submission ID)
   * Body: {
   *   nilai: number,
   *   feedback?: string
   * }
   */
  gradeSubmission: async (submissionId, data) => {
    const response = await axiosInstance.put(
      `/tugas/submission/${submissionId}/grade`,
      data
    );
    return response.data;
  },
};
