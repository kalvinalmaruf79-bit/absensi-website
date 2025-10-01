// src/context/AuthContext.js
"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import {
  getToken,
  setToken,
  removeToken,
  setUser as setUserToLs,
  getUser,
} from "@/lib/api-helpers";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = getToken();
      if (token) {
        const userFromLs = getUser();
        if (userFromLs) {
          setUser(userFromLs);
        } else {
          const response = await authService.getProfile();
          setUser(response.data);
          setUserToLs(response.data);
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const loginData = await authService.login(credentials);
      const { token, user: userData } = loginData;

      // Tolak login jika role adalah siswa
      if (userData.role === "siswa") {
        throw new Error("Siswa hanya dapat login melalui aplikasi mobile.");
      }

      // Set token dan user ke storage
      setToken(token);
      setUserToLs(userData);
      setUser(userData);

      // Redirect langsung ke dashboard yang sesuai
      const dashboardPath = getDashboardPath(userData.role);
      router.push(dashboardPath);

      return loginData;
    } catch (error) {
      console.error("Login failed:", error);
      // Teruskan error agar bisa ditangani di halaman login
      throw error;
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
    router.push("/login");
  };

  const updateProfile = (updatedUser) => {
    setUser(updatedUser);
    setUserToLs(updatedUser);
  };

  const getDashboardPath = (role) => {
    switch (role) {
      case "super_admin":
        return "/super-admin/dashboard";
      case "guru":
        return "/guru/dashboard";
      default:
        return "/login";
    }
  };

  const redirectToDashboard = (role) => {
    const dashboardPath = getDashboardPath(role || user?.role);
    router.push(dashboardPath);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateProfile,
        isAuthenticated: !!user,
        redirectToDashboard,
        getDashboardPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
