"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, KeyRound, Mail, Book, Loader2, Save } from "lucide-react";
import { authService } from "@/services/auth.service";
import { showToast } from "@/lib/toast";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const ProfileInfoItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-4 py-3 border-b border-neutral-light/20 last:border-b-0">
    <div className="text-primary mt-1">{icon}</div>
    <div className="flex-1">
      <p className="text-sm text-neutral-secondary">{label}</p>
      <p className="font-medium text-neutral-text">{value}</p>
    </div>
  </div>
);

export default function GuruProfilePage() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const data = await authService.getProfile();
        setProfile(data);
      } catch (error) {
        showToast.error(error.response?.data?.message || "Gagal memuat profil");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast.error("Password baru dan konfirmasi tidak cocok.");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showToast.error("Password baru minimal harus 6 karakter.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authService.changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      showToast.success(response.message);
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      showToast.error(
        error.response?.data?.message || "Gagal mengganti password"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center">
        <p>Gagal memuat data profil. Silakan coba lagi.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-neutral-text mb-8">
          Profil Saya
        </h1>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kolom Informasi Profil */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <Card>
            <div className="flex flex-col items-center p-4">
              <div className="w-24 h-24 bg-gradient-to-br from-[#00a3d4] to-[#005f8b] rounded-full flex items-center justify-center shadow-lg mb-4">
                <span className="text-4xl font-bold text-white">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl font-bold text-neutral-text">
                {profile.name}
              </h2>
              <p className="text-neutral-secondary">{profile.identifier}</p>
            </div>
            <div className="p-4">
              <ProfileInfoItem
                icon={<Mail className="w-5 h-5" />}
                label="Email"
                value={profile.email || "-"}
              />
              <ProfileInfoItem
                icon={<Book className="w-5 h-5" />}
                label="Mata Pelajaran Diampu"
                value={
                  profile.mataPelajaran?.map((mp) => mp.nama).join(", ") ||
                  "Belum ada"
                }
              />
            </div>
          </Card>
        </motion.div>

        {/* Kolom Ganti Password */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <div className="flex items-center gap-3 p-6 border-b border-neutral-light/20">
              <KeyRound className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-neutral-text">
                Ganti Password
              </h2>
            </div>
            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-5">
              <Input
                label="Password Lama"
                type="password"
                id="oldPassword"
                name="oldPassword"
                value={passwordData.oldPassword}
                onChange={handlePasswordChange}
                placeholder="Masukkan password Anda saat ini"
                required
              />
              <Input
                label="Password Baru"
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Minimal 6 karakter"
                required
              />
              <Input
                label="Konfirmasi Password Baru"
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Ulangi password baru"
                required
              />
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5 mr-2" />
                  )}
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
