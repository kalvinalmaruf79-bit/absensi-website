// src/components/guru/LocationPickerMap.jsx
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { Search, Crosshair, MapPin, Loader2, X } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// ========================================
// PRESET LOKASI - Mudah untuk dihapus/diubah
// ========================================
const PRESET_LOCATIONS = [
  {
    id: 1,
    name: "SMKN 1 Nanga Pinoh",
    icon: "🏫",
    latitude: -0.33336364097132754,
    longitude: 111.72678850556599,
    color: "blue",
  },
  {
    id: 2,
    name: "Kosanku",
    icon: "🏠",
    latitude: -7.767141239060202,
    longitude: 110.40029594091214,
    color: "green",
  },
  {
    id: 3,
    name: "Green Kost",
    icon: "🌿",
    latitude: -7.739958473662975,
    longitude: 110.3507250910721,
    color: "emerald",
  },
  {
    id: 4,
    name: "UTY Puskom",
    icon: "🎓",
    latitude: -7.748808326519072,
    longitude: 110.3545380604153,
    color: "purple",
  },
];
// ========================================

function LocationMarker({ position, onLocationChange }) {
  const map = useMapEvents({
    click(e) {
      onLocationChange({
        latitude: e.latlng.lat,
        longitude: e.latlng.lng,
      });
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position ? (
    <Marker position={[position.latitude, position.longitude]} />
  ) : null;
}

export default function LocationPickerMap({
  onLocationSelect,
  initialLocation,
}) {
  const [position, setPosition] = useState(
    initialLocation || {
      latitude: -7.797068,
      longitude: 110.370529,
    }
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const searchTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (initialLocation) {
      setPosition(initialLocation);
    }
  }, [initialLocation]);

  useEffect(() => {
    if (onLocationSelect) {
      onLocationSelect(position);
    }
  }, [position, onLocationSelect]);

  const handleGetCurrentLocation = () => {
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        setPosition(newPos);
        setIsGettingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Gagal mendapatkan lokasi. Pastikan izin lokasi diaktifkan.");
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Multi-provider search dengan prioritas
  const searchMultiProvider = async (query) => {
    const results = [];

    try {
      // 1. Photon (OpenStreetMap data, sangat bagus untuk Indonesia)
      const photonResponse = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(
          query
        )}&lat=-7.797068&lon=110.370529&limit=5`
      );
      const photonData = await photonResponse.json();

      if (photonData.features) {
        photonData.features.forEach((feature) => {
          results.push({
            provider: "photon",
            lat: feature.geometry.coordinates[1],
            lon: feature.geometry.coordinates[0],
            display_name:
              feature.properties.name || feature.properties.street || "Lokasi",
            address: [
              feature.properties.street,
              feature.properties.city || feature.properties.county,
              feature.properties.state,
              feature.properties.country,
            ]
              .filter(Boolean)
              .join(", "),
            type: feature.properties.type,
            importance: 1,
          });
        });
      }
    } catch (error) {
      console.warn("Photon search failed:", error);
    }

    try {
      // 2. Nominatim (Backup, lebih konservatif)
      const nominatimResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&countrycodes=id&limit=5&addressdetails=1`
      );
      const nominatimData = await nominatimResponse.json();

      nominatimData.forEach((item) => {
        results.push({
          provider: "nominatim",
          lat: item.lat,
          lon: item.lon,
          display_name: item.display_name,
          address: item.display_name,
          type: item.type,
          importance: item.importance || 0.5,
        });
      });
    } catch (error) {
      console.warn("Nominatim search failed:", error);
    }

    // 3. Deduplikasi berdasarkan kedekatan lokasi (radius 50m)
    const uniqueResults = [];
    results.forEach((result) => {
      const isDuplicate = uniqueResults.some((existing) => {
        const distance = Math.sqrt(
          Math.pow(
            (parseFloat(result.lat) - parseFloat(existing.lat)) * 111000,
            2
          ) +
            Math.pow(
              (parseFloat(result.lon) - parseFloat(existing.lon)) * 111000,
              2
            )
        );
        return distance < 50; // 50 meter threshold
      });

      if (!isDuplicate) {
        uniqueResults.push(result);
      }
    });

    // Sort by importance
    return uniqueResults
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 8);
  };

  // Debounced autocomplete search
  const handleAutocompleteSearch = useCallback(async (query) => {
    if (query.trim().length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);

    try {
      const results = await searchMultiProvider(query);
      setSearchResults(results);
      setShowResults(results.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error("Error searching location:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle input change with debounce
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for autocomplete
    searchTimeoutRef.current = setTimeout(() => {
      handleAutocompleteSearch(value);
    }, 500); // 500ms debounce
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    // Clear timeout if user clicks search button
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setIsSearching(true);

    try {
      const results = await searchMultiProvider(searchQuery);

      if (results.length > 0) {
        setSearchResults(results);
        setShowResults(true);
        setSelectedIndex(-1);
      } else {
        alert(
          "Lokasi tidak ditemukan. Coba kata kunci lain atau gunakan lokasi saat ini."
        );
      }
    } catch (error) {
      console.error("Error searching location:", error);
      alert("Gagal mencari lokasi. Silakan coba lagi.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result) => {
    const newPos = {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
    };
    setPosition(newPos);
    setShowResults(false);
    setSearchQuery(result.display_name);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!showResults || searchResults.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearch();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          handleSelectSearchResult(searchResults[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case "Escape":
        setShowResults(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Handler untuk memilih preset lokasi
  const handleSelectPresetLocation = (preset) => {
    const newPos = {
      latitude: preset.latitude,
      longitude: preset.longitude,
    };
    setPosition(newPos);
    setSearchQuery(preset.name);
    setShowResults(false);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Preset Lokasi - Quick Select */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/20">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <span className="text-lg">⚡</span>
          </div>
          <span className="font-semibold text-neutral-text">
            Lokasi Favorit
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {PRESET_LOCATIONS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPresetLocation(preset)}
              className={`p-3 rounded-lg border-2 transition-all hover:scale-105 active:scale-95 ${
                position.latitude === preset.latitude &&
                position.longitude === preset.longitude
                  ? "border-primary bg-primary/10"
                  : "border-neutral-light/20 bg-white hover:border-primary/30"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{preset.icon}</span>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-neutral-text line-clamp-1">
                    {preset.name}
                  </p>
                  <p className="text-xs text-neutral-secondary font-mono">
                    {preset.latitude.toFixed(4)}, {preset.longitude.toFixed(4)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar with Autocomplete */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-light z-10" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ketik minimal 3 huruf untuk pencarian otomatis..."
              className="w-full pl-10 pr-10 py-3 bg-white border border-neutral-light/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              autoComplete="off"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full hover:bg-neutral-light/10 flex items-center justify-center transition-colors z-10"
              >
                <X className="w-4 h-4 text-neutral-light" />
              </button>
            )}
            {isSearching && (
              <div className="absolute right-10 top-1/2 -translate-y-1/2 z-10">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            )}
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
          >
            <Search className="w-5 h-5" />
            <span className="hidden sm:inline">Cari</span>
          </button>
        </div>

        {/* Autocomplete Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-light/20 rounded-xl shadow-2xl max-h-96 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-2 border-b border-neutral-light/10 bg-neutral-light/5">
              <p className="text-xs font-semibold text-neutral-secondary">
                {searchResults.length} lokasi ditemukan
              </p>
            </div>
            {searchResults.map((result, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSearchResult(result)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`w-full text-left px-4 py-3 transition-colors border-b border-neutral-light/10 last:border-b-0 ${
                  selectedIndex === idx
                    ? "bg-primary/10"
                    : "hover:bg-neutral-light/10"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      selectedIndex === idx ? "bg-primary/20" : "bg-primary/10"
                    }`}
                  >
                    <MapPin
                      className={`w-5 h-5 ${
                        selectedIndex === idx
                          ? "text-primary"
                          : "text-primary/70"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-text line-clamp-1">
                      {result.display_name}
                    </p>
                    {result.address && (
                      <p className="text-xs text-neutral-secondary mt-1 line-clamp-2">
                        {result.address}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          result.provider === "photon"
                            ? "bg-success/10 text-success"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {result.provider === "photon" ? "🎯 Akurat" : "📍 OSM"}
                      </span>
                      <span className="text-xs text-neutral-light font-mono">
                        {parseFloat(result.lat).toFixed(5)},{" "}
                        {parseFloat(result.lon).toFixed(5)}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
            <div className="px-4 py-2 bg-neutral-light/5 border-t border-neutral-light/10">
              <p className="text-xs text-neutral-secondary">
                💡 Gunakan ↑↓ untuk navigasi, Enter untuk pilih, Esc untuk tutup
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={handleGetCurrentLocation}
          disabled={isGettingLocation}
          className="py-3 bg-white border-2 border-primary text-primary hover:bg-primary/5 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isGettingLocation ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Mendapatkan Lokasi...</span>
            </>
          ) : (
            <>
              <Crosshair className="w-5 h-5" />
              <span>Lokasi Saat Ini</span>
            </>
          )}
        </button>

        <button
          onClick={() => setShowResults(false)}
          disabled={!showResults}
          className="py-3 bg-neutral-light/10 text-neutral-text hover:bg-neutral-light/20 rounded-xl font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <X className="w-5 h-5" />
          <span>Tutup Hasil</span>
        </button>
      </div>

      {/* Selected Coordinates Display */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/20">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold text-neutral-text">
            Koordinat Terpilih
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/50 rounded-lg p-3">
            <p className="text-xs text-neutral-secondary mb-1 font-medium">
              Latitude
            </p>
            <p className="font-mono text-sm font-bold text-neutral-text">
              {position.latitude.toFixed(6)}
            </p>
          </div>
          <div className="bg-white/50 rounded-lg p-3">
            <p className="text-xs text-neutral-secondary mb-1 font-medium">
              Longitude
            </p>
            <p className="font-mono text-sm font-bold text-neutral-text">
              {position.longitude.toFixed(6)}
            </p>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="relative rounded-xl overflow-hidden border-2 border-neutral-light/20 shadow-lg">
        <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md">
          <p className="text-xs font-medium text-neutral-secondary flex items-center gap-2">
            <span>💡</span>
            <span>Klik pada peta untuk memilih lokasi</span>
          </p>
        </div>

        <MapContainer
          center={[position.latitude, position.longitude]}
          zoom={16}
          style={{ height: "450px", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} onLocationChange={setPosition} />
        </MapContainer>
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-br from-info/5 to-info/10 border border-info/20 rounded-xl p-4">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-info/20 flex items-center justify-center flex-shrink-0">
            <span className="text-sm">⚡</span>
          </div>
          <div className="text-sm text-neutral-text">
            <p className="font-semibold mb-2">Fitur Autocomplete Aktif!</p>
            <ul className="space-y-1.5 text-neutral-secondary">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  Ketik minimal <strong>3 huruf</strong> untuk pencarian
                  otomatis
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  Hasil muncul otomatis dalam <strong>0.5 detik</strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  Gunakan <strong>↑↓</strong> untuk navigasi keyboard
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  Tekan <strong>Enter</strong> untuk memilih lokasi
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
