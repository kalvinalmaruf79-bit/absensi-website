// src/lib/toast.js
import { toast } from "react-toastify";

/**
 * Centralized toast notification utility
 * Provides consistent styling and behavior across the app
 */

const defaultOptions = {
  position: "top-center",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

export const showToast = {
  success: (message, options = {}) => {
    toast.success(message, {
      ...defaultOptions,
      ...options,
    });
  },

  error: (message, options = {}) => {
    toast.error(message, {
      ...defaultOptions,
      autoClose: 5000, // Error messages stay longer
      ...options,
    });
  },

  warning: (message, options = {}) => {
    toast.warning(message, {
      ...defaultOptions,
      ...options,
    });
  },

  info: (message, options = {}) => {
    toast.info(message, {
      ...defaultOptions,
      ...options,
    });
  },

  promise: (promise, messages, options = {}) => {
    return toast.promise(
      promise,
      {
        pending: messages.pending || "Memproses...",
        success: messages.success || "Berhasil!",
        error: messages.error || "Terjadi kesalahan",
      },
      {
        ...defaultOptions,
        ...options,
      }
    );
  },
};

// Dismiss all toasts
export const dismissAllToasts = () => {
  toast.dismiss();
};

// Dismiss specific toast
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};
