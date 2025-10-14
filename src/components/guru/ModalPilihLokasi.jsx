// src/components/guru/ModalPilihLokasi.jsx
"use client";

import { useState, useEffect } from "react";
import { X, MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";

// Import dynamic untuk menghindari SSR issues dengan Leaflet
const LocationPickerMap = dynamic(
  () => import("@/components/guru/LocationPickerMap"),
  { ssr: false }
);

export default function ModalPilihLokasi({
  isOpen,
  onClose,
  onConfirm,
  initialLocation,
}) {
  const [selectedLocation, setSelectedLocation] = useState(
    initialLocation || { latitude: -7.797068, longitude: 110.370529 }
  );

  useEffect(() => {
    if (initialLocation) {
      setSelectedLocation(initialLocation);
    }
  }, [initialLocation]);

  const handleConfirm = () => {
    onConfirm(selectedLocation);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-light/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-neutral-text">
                      Pilih Lokasi Presensi
                    </h2>
                    <p className="text-sm text-neutral-secondary">
                      Tentukan lokasi untuk sesi presensi
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl hover:bg-neutral-light/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-light" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <LocationPickerMap
                  onLocationSelect={setSelectedLocation}
                  initialLocation={selectedLocation}
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-light/20 bg-neutral-light/5">
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-white border border-neutral-light/20 text-neutral-text hover:bg-neutral-light/10 rounded-xl font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                  <MapPin className="w-5 h-5" />
                  Konfirmasi Lokasi
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
