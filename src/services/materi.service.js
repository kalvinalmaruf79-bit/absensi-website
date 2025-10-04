// src/services/materi.service.js
import axiosInstance from "@/lib/axios-instance";

export const materiService = {
  /**
   * Create Materi (Guru)
   * Body: FormData dengan fields:
   *   - judul: string
   *   - deskripsi: string
   *   - mataPelajaran: string (ID)
   *   - kelas: string (ID)
   *   - files: File[] (optional, max 5 files)
   *   - links: JSON string array of objects [{title, url}]
   */
  createMateri: async (formData) => {
    const response = await axiosInstance.post("/materi", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  /**
   * Get Materi
   * Query: ?kelasId=xxx&mataPelajaranId=xxx&isPublished=true
   */
  getMateri: async (params) => {
    const response = await axiosInstance.get("/materi", { params });
    return response.data;
  },

  /**
   * Get Materi By ID
   * Params: id (materi ID)
   */
  getMateriById: async (id) => {
    const response = await axiosInstance.get(`/materi/${id}`);
    return response.data;
  },

  /**
   * Update Materi (Guru)
   * Params: id (materi ID)
   * Body: FormData or regular object with:
   *   - judul?: string
   *   - deskripsi?: string
   *   - isPublished?: boolean
   *   - files?: File[] (optional)
   *   - links?: JSON string array
   */
  updateMateri: async (id, data) => {
    const headers = {};
    if (data instanceof FormData) {
      headers["Content-Type"] = "multipart/form-data";
    }
    const response = await axiosInstance.put(`/materi/${id}`, data, {
      headers,
    });
    return response.data;
  },

  /**
   * Delete Materi (Guru)
   * Params: id (materi ID)
   */
  deleteMateri: async (id) => {
    const response = await axiosInstance.delete(`/materi/${id}`);
    return response.data;
  },

  /**
   * Toggle Publish Materi (Guru)
   * Params: id (materi ID)
   */
  togglePublishMateri: async (id) => {
    const response = await axiosInstance.patch(`/materi/${id}/toggle-publish`);
    return response.data;
  },

  /**
   * Delete File from Materi (Guru)
   * Params: id (materi ID), publicId (file public_id)
   */
  deleteMateriFile: async (id, publicId) => {
    const response = await axiosInstance.delete(
      `/materi/${id}/file/${publicId}`
    );
    return response.data;
  },
};
