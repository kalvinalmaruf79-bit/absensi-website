// ==========================================
// FILE 2: src/lib/api-helpers.js
// ==========================================

/**
 * Store token to localStorage and cookie
 */
export const setToken = (token) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
    // Set cookie untuk middleware
    document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 hari
  }
};

/**
 * Get token from localStorage
 */
export const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

/**
 * Remove token from localStorage and cookie
 */
export const removeToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Hapus cookie
    document.cookie = "token=; path=/; max-age=0";
  }
};

/**
 * Store user data to localStorage
 */
export const setUser = (user) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(user));
  }
};

/**
 * Get user data from localStorage
 */
export const getUser = () => {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }
  return null;
};

/**
 * Handle API Error Response
 */
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.message || "Terjadi kesalahan pada server",
      status: error.response.status,
      data: error.response.data,
    };
  } else if (error.request) {
    // Request made but no response
    return {
      message:
        "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
      status: 0,
    };
  } else {
    // Error in setting up request
    return {
      message: error.message || "Terjadi kesalahan",
      status: 0,
    };
  }
};

/**
 * Download file from blob response
 */
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
