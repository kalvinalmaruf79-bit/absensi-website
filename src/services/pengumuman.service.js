// src/services/pengumuman.service.js
import axiosInstance from "@/lib/axios-instance";

export const pengumumanService = {
  /**
   * Create Pengumuman (Admin/Guru)
   */
  createPengumuman: async (data) => {
    const response = await axiosInstance.post("/pengumuman", data);
    return response.data;
  },

  /**
   * Get All Pengumuman
   */
  getPengumuman: async (params) => {
    const response = await axiosInstance.get("/pengumuman", { params });
    return response.data;
  },

  /**
   * Get Pengumuman by ID
   */
  getPengumumanById: async (id) => {
    const response = await axiosInstance.get(`/pengumuman/${id}`);
    return response.data;
  },

  /**
   * Update Pengumuman
   */
  updatePengumuman: async (id, data) => {
    const response = await axiosInstance.put(`/pengumuman/${id}`, data);
    return response.data;
  },

  /**
   * Delete Pengumuman
   */
  deletePengumuman: async (id) => {
    const response = await axiosInstance.delete(`/pengumuman/${id}`);
    return response.data;
  },

  /**
   * Publish/Unpublish Pengumuman
   */
  togglePublish: async (id) => {
    const response = await axiosInstance.patch(
      `/pengumuman/${id}/toggle-publish`
    );
    return response.data;
  },
};
