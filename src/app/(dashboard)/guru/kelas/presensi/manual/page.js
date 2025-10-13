"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  UserPlus,
  AlertCircle,
  ArrowLeft,
  Calendar,
  Users,
  BookOpen,
  CheckCircle,
  Search,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Card from "@/components/ui/Card";
import { guruService } from "@/services/guru.service";
import { absensiService } from "@/services/absensi.service";
import { showToast } from "@/lib/toast";

export default function ManualAttendancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jadwalId = searchParams.get("jadwalId");

  const [jadwal, setJadwal] = useState(null);
  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [siswaList, setSiswaList] = useState([]);
  const [absensiData, setAbsensiData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (jadwalId) {
      initializePage();
    }
  }, [jadwalId]);

  useEffect(() => {
    if (jadwal && tanggal) {
      loadAbsensiData();
    }
  }, [tanggal, jadwal]);

  const initializePage = async () => {
    try {
      setIsFetchingData(true);
      const allJadwal = await guruService.getJadwalGuru();
      let foundJadwal = null;
      Object.values(allJadwal).forEach((jadwalPerHari) => {
        const match = jadwalPerHari.find((j) => j._id === jadwalId);
        if (match) foundJadwal = match;
      });

      if (!foundJadwal) {
        showToast.error("Jadwal tidak ditemukan");
        router.push("/guru/kelas/presensi");
        return;
      }

      setJadwal(foundJadwal);

      // PERBAIKAN DI SINI
      const response = await guruService.getSiswaKelas(foundJadwal.kelas._id, {
        limit: 100, // Ambil semua siswa dalam satu halaman
      });

      // Mengakses response.docs (array siswa) bukan response.data
      setSiswaList(response.docs || []);
    } catch (error) {
      console.error("Error initializing page:", error);
      showToast.error("Gagal memuat data");
      router.push("/guru/kelas/presensi");
    } finally {
      setIsFetchingData(false);
    }
  };

  const loadAbsensiData = async () => {
    try {
      const response = await guruService.getAbsensiBySesi({
        kelasId: jadwal.kelas._id,
        mataPelajaranId: jadwal.mataPelajaran._id,
        tanggal: tanggal,
      });

      const absensiMap = {};
      response.forEach((item) => {
        if (item.siswa && item.siswa._id) {
          absensiMap[item.siswa._id] = {
            _id: item._id,
            keterangan: item.keterangan,
            waktuMasuk: item.waktuMasuk,
          };
        }
      });

      setAbsensiData(absensiMap);
    } catch (error) {
      console.error("Error loading absensi data:", error);
      showToast.error("Gagal memuat data absensi");
    }
  };

  const handleKeteranganChange = (siswaId, keterangan) => {
    setAbsensiData((prev) => ({
      ...prev,
      [siswaId]: {
        ...prev[siswaId],
        keterangan: keterangan,
        _id: prev[siswaId]?._id || null,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      // Filter hanya siswa yang sudah dipilih status (bukan default alpa yang tidak diubah)
      const dataToSubmit = Object.entries(absensiData)
        .filter(([_, data]) => data.keterangan) // Pastikan ada keterangan
        .map(([siswaId, data]) => ({
          siswaId,
          jadwalId: jadwal._id,
          keterangan: data.keterangan,
          tanggal: tanggal,
        }));

      if (dataToSubmit.length === 0) {
        showToast.error("Tidak ada data absensi yang diubah");
        return;
      }

      // Submit satu per satu dengan Promise.all
      const promises = dataToSubmit.map((item) =>
        absensiService.createManualAbsensi(item)
      );

      await Promise.all(promises);

      showToast.success(
        `Berhasil menyimpan ${dataToSubmit.length} data absensi`
      );

      // Reload data
      await loadAbsensiData();
    } catch (error) {
      console.error("Error saving absensi:", error);
      showToast.error(
        error.response?.data?.message || "Gagal menyimpan absensi"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSiswa = siswaList.filter((siswa) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      siswa.name.toLowerCase().includes(search) ||
      siswa.identifier.toLowerCase().includes(search)
    );
  });

  const getStatusCount = () => {
    const counts = { hadir: 0, izin: 0, sakit: 0, alpa: 0 };
    Object.values(absensiData).forEach((data) => {
      if (data.keterangan && counts.hasOwnProperty(data.keterangan)) {
        counts[data.keterangan]++;
      }
    });
    return counts;
  };

  const statusCount = getStatusCount();

  if (isFetchingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!jadwal) {
    return null;
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          onClick={() => router.push("/guru/kelas/presensi")}
          className="flex items-center gap-2 text-neutral-secondary hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Kembali ke Presensi</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-darkest flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-text">
              Absensi Manual
            </h1>
            <p className="text-neutral-secondary">
              Input absensi siswa secara manual
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <h3 className="font-semibold text-neutral-text mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Informasi Jadwal
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-neutral-secondary font-medium uppercase tracking-wide mb-1 block">
                  Mata Pelajaran
                </label>
                <p className="text-neutral-text font-medium">
                  {jadwal.mataPelajaran.nama}
                </p>
              </div>

              <div>
                <label className="text-xs text-neutral-secondary font-medium uppercase tracking-wide mb-1 block">
                  Kelas
                </label>
                <p className="text-neutral-text font-medium">
                  {jadwal.kelas.nama}
                </p>
              </div>

              <div>
                <label className="text-xs text-neutral-secondary font-medium uppercase tracking-wide mb-1 block">
                  Hari
                </label>
                <p className="text-neutral-text font-medium capitalize">
                  {jadwal.hari}
                </p>
              </div>

              <div>
                <label className="text-xs text-neutral-secondary font-medium uppercase tracking-wide mb-1 block">
                  Jam Pelajaran
                </label>
                <p className="text-neutral-text font-medium">
                  {jadwal.jamMulai} - {jadwal.jamSelesai}
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-border">
                <h4 className="text-sm font-medium text-neutral-text mb-3">
                  Statistik Absensi
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-success/10 rounded-lg p-2 text-center">
                    <div className="text-2xl font-bold text-success">
                      {statusCount.hadir}
                    </div>
                    <div className="text-xs text-success">Hadir</div>
                  </div>
                  <div className="bg-warning/10 rounded-lg p-2 text-center">
                    <div className="text-2xl font-bold text-warning">
                      {statusCount.izin}
                    </div>
                    <div className="text-xs text-warning">Izin</div>
                  </div>
                  <div className="bg-info/10 rounded-lg p-2 text-center">
                    <div className="text-2xl font-bold text-info">
                      {statusCount.sakit}
                    </div>
                    <div className="text-xs text-info">Sakit</div>
                  </div>
                  <div className="bg-danger/10 rounded-lg p-2 text-center">
                    <div className="text-2xl font-bold text-danger">
                      {statusCount.alpa}
                    </div>
                    <div className="text-xs text-danger">Alpa</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-border">
                <div className="bg-info/10 border border-info/20 rounded-lg p-3 flex gap-2">
                  <AlertCircle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-info">
                    Pastikan data siswa dan keterangan yang diinput sudah benar
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-neutral-text flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                Daftar Siswa & Absensi
              </h3>
              <div className="text-sm text-neutral-secondary">
                Total: {siswaList.length} siswa
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-neutral-light/50 rounded-lg">
                <Calendar className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-neutral-text mb-2">
                    Tanggal Absensi
                  </label>
                  <input
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-secondary" />
                <input
                  type="text"
                  placeholder="Cari siswa (nama atau NIS)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {filteredSiswa.length === 0 ? (
                  <div className="text-center py-8 text-neutral-secondary">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Tidak ada siswa ditemukan</p>
                  </div>
                ) : (
                  filteredSiswa.map((siswa) => {
                    const currentStatus =
                      absensiData[siswa._id]?.keterangan || "alpa";
                    const isExisting = absensiData[siswa._id]?._id;

                    return (
                      <div
                        key={siswa._id}
                        className="border border-neutral-border rounded-lg p-4 hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-neutral-text">
                              {siswa.name}
                            </h4>
                            <p className="text-sm text-neutral-secondary">
                              NIS: {siswa.identifier}
                            </p>
                            {isExisting && (
                              <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-info/10 text-info rounded">
                                Sudah terekam
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                          {[
                            {
                              value: "hadir",
                              label: "Hadir",
                              color: "success",
                            },
                            { value: "izin", label: "Izin", color: "warning" },
                            { value: "sakit", label: "Sakit", color: "info" },
                            { value: "alpa", label: "Alpa", color: "danger" },
                          ].map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() =>
                                handleKeteranganChange(siswa._id, option.value)
                              }
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                currentStatus === option.value
                                  ? option.color === "success"
                                    ? "bg-success text-white"
                                    : option.color === "warning"
                                    ? "bg-warning text-white"
                                    : option.color === "info"
                                    ? "bg-info text-white"
                                    : "bg-danger text-white"
                                  : "bg-neutral-light text-neutral-text hover:bg-neutral-border"
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-warning mb-1">
                    Perhatian
                  </p>
                  <p className="text-sm text-warning/80">
                    Klik tombol status untuk mengubah kehadiran siswa. Data yang
                    sudah disimpan dapat diperbarui dengan mengubah status dan
                    klik simpan kembali.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-neutral-border">
                <button
                  type="button"
                  onClick={() => router.push("/guru/kelas/presensi")}
                  className="flex-1 px-6 py-3 border border-neutral-border rounded-lg font-medium text-neutral-text hover:bg-neutral-light/50 transition-colors"
                  disabled={isLoading}
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading || filteredSiswa.length === 0}
                  className="flex-1 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors disabled:bg-neutral-light disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Simpan Absensi
                    </>
                  )}
                </button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
