// 2. src/services/auth.service.js
// ============================================
import axiosInstance from "@/lib/axios-instance";

export const authService = {
  /**
   * Login User
   * Body: {
   *   identifier: string, // NIP/NISN/username
   *   password: string
   * }
   */
  login: async (credentials) => {
    const response = await axiosInstance.post("/auth/login", credentials);
    return response.data;
  },

  /**
   * Get User Profile
   * Headers: Authorization Bearer Token
   */
  getProfile: async () => {
    const response = await axiosInstance.get("/auth/profile");
    return response.data;
  },

  /**
   * Change Password
   * Body: {
   *   oldPassword: string,
   *   newPassword: string
   * }
   */
  changePassword: async (data) => {
    const response = await axiosInstance.put("/auth/change-password", data);
    return response.data;
  },

  /**
   * Forgot Password
   * Body: {
   *   email: string
   * }
   */
  forgotPassword: async (email) => {
    const response = await axiosInstance.post("/auth/forgot-password", {
      email,
    });
    return response.data;
  },

  /**
   * Reset Password
   * Params: token (dari email)
   * Body: {
   *   password: string
   * }
   */
  resetPassword: async (token, password) => {
    const response = await axiosInstance.put(`/auth/reset-password/${token}`, {
      password,
    });
    return response.data;
  },

  /**
   * Register Device Token (untuk push notification)
   * Body: {
   *   deviceToken: string
   * }
   */
  registerDevice: async (deviceToken) => {
    const response = await axiosInstance.post("/auth/register-device", {
      deviceToken,
    });
    return response.data;
  },
};
