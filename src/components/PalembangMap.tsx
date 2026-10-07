import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { IncidentReport, AirQualityStation, IncidentCategory } from '../types';
import { PALEMBANG_CENTER } from '../data/seedData';
import { Flame, ShieldAlert, Car, Waves, Users, AlertTriangle, Calendar, Wind, Navigation } from 'lucide-react';

interface PalembangMapProps {
  incidents: IncidentReport[];
  airQualityStations: AirQualityStation[];
  selectedCategory: string;
  showAqiLayer: boolean;
  onSelectIncident: (incident: IncidentReport) => void;
  onSelectStation?: (station: AirQualityStation) => void;
  isPickingLocation?: boolean;
  pickedLocation?: { lat: number; lng: number } | null;
  onPickLocation?: (coords: { lat: number; lng: number }) => void;
}

// Category Marker Color and SVG styling
const getCategoryColor = (category: IncidentCategory): { bg: string; border: string; text: string; icon: string } => {
  switch (category) {
    case 'begal':
      return { bg: '#ef4444', border: '#b91c1c', text: '#ffffff', icon: '🚨' };
    case 'kecelakaan':
      return { bg: '#f97316', border: '#c2410c', text: '#ffffff', icon: '💥' };
    case 'macet':
      return { bg: '#eab308', border: '#a16207', text: '#1e293b', icon: '🚗' };
    case 'banjir':
      return { bg: '#06b6d4', border: '#0e7490', text: '#ffffff', icon: '🌊' };
    case 'kebakaran':
      return { bg: '#dc2626', border: '#991b1b', text: '#ffffff', icon: '🔥' };
    case 'demo':
      return { bg: '#a855f7', border: '#7e22ce', text: '#ffffff', icon: '📢' };
    case 'event':
      return { bg: '#10b981', border: '#047857', text: '#ffffff', icon: '🎉' };
    default:
      return { bg: '#64748b', border: '#475569', text: '#ffffff', icon: '📍' };
  }
};

const getAqiBadgeColor = (status: string): string => {
  switch (status) {
    case 'BAIK':
      return '#10b981';
    case 'SEDANG':
      return '#f59e0b';
    case 'TIDAK_SEHAT':
      return '#ef4444';
    case 'SANGAT_TIDAK_SEHAT':
      return '#8b5cf6';
    case 'BERBAHAYA':
      return '#78350f';
    default:
      return '#64748b';
  }
};

export const PalembangMap: React.FC<PalembangMapProps> = ({
  incidents,
  airQualityStations,
  selectedCategory,
  showAqiLayer,
  onSelectIncident,
  onSelectStation,
  isPickingLocation,
  pickedLocation,
  onPickLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const aqiLayerRef = useRef<L.LayerGroup | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: PALEMBANG_CENTER,
      zoom: 13,
      zoomControl: false,
    });

    // High fidelity CartoDB Voyager map tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap contributors',
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Zoom control on top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    const aqiLayer = L.layerGroup().addTo(map);

    markersLayerRef.current = markersLayer;
    aqiLayerRef.current = aqiLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle map click for location picking
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      if (isPickingLocation && onPickLocation) {
        onPickLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [isPickingLocation, onPickLocation]);

  // Update picker marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (pickedLocation) {
      if (pickerMarkerRef.current) {
        pickerMarkerRef.current.setLatLng([pickedLocation.lat, pickedLocation.lng]);
      } else {
        const pickerIcon = L.divIcon({
          className: 'custom-picker-pin',
          html: `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
              <div style="width: 38px; height: 38px; border-radius: 50%; background: #3b82f6; border: 3px solid #ffffff; box-shadow: 0 4px 15px rgba(59,130,246,0.6); display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; font-weight: bold;" class="beacon-pulse">
                📍
              </div>
              <div style="margin-top: 4px; background: #1e293b; color: #93c5fd; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; border: 1px solid #3b82f6; white-space: nowrap; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                Titik Laporan Dipilih
              </div>
            </div>
          `,
          iconSize: [38, 55],
          iconAnchor: [19, 45],
        });

        pickerMarkerRef.current = L.marker([pickedLocation.lat, pickedLocation.lng], {
          icon: pickerIcon,
          zIndexOffset: 1000,
        }).addTo(map);
      }
    } else if (pickerMarkerRef.current) {
      pickerMarkerRef.current.remove();
      pickerMarkerRef.current = null;
    }
  }, [pickedLocation]);

  // Render Incident Markers
  useEffect(() => {
    const markersLayer = markersLayerRef.current;
    if (!markersLayer) return;

    markersLayer.clearLayers();

    const filtered = incidents.filter((item) => {
      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'kriminal') return item.category === 'begal';
      if (selectedCategory === 'lalulintas') return item.category === 'kecelakaan' || item.category === 'macet';
      if (selectedCategory === 'bencana') return item.category === 'banjir' || item.category === 'kebakaran';
      return item.category === selectedCategory;
    });

    filtered.forEach((incident) => {
      const colors = getCategoryColor(incident.category);
      const isCritical = incident.severity === 'critical' || incident.category === 'begal' || incident.category === 'kebakaran';
      const isPending = incident.status === 'pending';

      const customHtml = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          ${isPending ? `
            <div style="position: absolute; -top: 8px; background: #eab308; color: #0f172a; font-size: 9px; font-weight: 800; padding: 1px 5px; border-radius: 9999px; box-shadow: 0 2px 5px rgba(0,0,0,0.5); z-index: 10; white-space: nowrap; border: 1px solid #ffffff;">
              ⏳ Kurasi Admin
            </div>
          ` : ''}
          <div style="
            width: ${isCritical ? '42px' : '36px'}; 
            height: ${isCritical ? '42px' : '36px'}; 
            border-radius: 50%; 
            background: ${colors.bg}; 
            border: ${isPending ? '3px dashed #facc15' : '3px solid #ffffff'}; 
            box-shadow: 0 4px 14px rgba(0,0,0,0.4); 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-size: ${isCritical ? '20px' : '17px'};
            transition: transform 0.2s ease;" 
            class="${isCritical || isPending ? 'beacon-pulse' : ''}">
            ${colors.icon}
          </div>
          <div style="
            margin-top: 2px;
            background: rgba(15, 23, 42, 0.9);
            color: #f8fafc;
            font-size: 10px;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 6px;
            border: 1px solid rgba(255,255,255,0.2);
            white-space: nowrap;
            max-width: 140px;
            text-overflow: ellipsis;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.5);
          ">
            ${incident.category.toUpperCase()}
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'incident-marker-pin',
        html: customHtml,
        iconSize: [42, 58],
        iconAnchor: [21, 48],
      });

      const marker = L.marker([incident.latitude, incident.longitude], { icon });

      // Interactive popup
      const popupContent = document.createElement('div');
      popupContent.className = 'p-3 w-64 text-left';
      popupContent.innerHTML = `
        <div class="flex items-center gap-2 mb-1.5">
          <span class="text-xs px-2 py-0.5 rounded-full font-bold uppercase" style="background:${colors.bg}; color:${colors.text}">
            ${incident.category}
          </span>
          <span class="text-[10px] ml-auto font-bold px-2 py-0.5 rounded-full ${
            incident.status === 'verified'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
              : incident.status === 'resolved'
              ? 'bg-blue-950 text-blue-300 border border-blue-600'
              : 'bg-amber-950 text-amber-300 border border-amber-500'
          }">
            ${incident.status === 'verified' ? '✓ Terverifikasi' : incident.status === 'resolved' ? '✓ Selesai' : '⏳ Menunggu Kurasi Admin'}
          </span>
        </div>
        <h4 class="font-bold text-sm text-white line-clamp-2 leading-tight mb-1">
          ${incident.title}
        </h4>
        <p class="text-xs text-slate-300 line-clamp-2 mb-2">
          ${incident.description}
        </p>
        <div class="text-[11px] text-slate-400 flex items-center gap-1 mb-2">
          <span>📍 ${incident.address}</span>
        </div>
        <button id="btn-view-${incident.id}" class="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-1.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-1 shadow">
          Lihat Berita & Laporan Warga ➜
        </button>
      `;

      marker.bindPopup(popupContent, { maxWidth: 280 });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-view-${incident.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectIncident(incident);
          };
        }
      });

      marker.addTo(markersLayer);
    });
  }, [incidents, selectedCategory, onSelectIncident]);

  // Render Air Quality Stations
  useEffect(() => {
    const aqiLayer = aqiLayerRef.current;
    if (!aqiLayer) return;

    aqiLayer.clearLayers();

    if (!showAqiLayer) return;

    airQualityStations.forEach((station) => {
      const color = getAqiBadgeColor(station.status);

      const html = `
        <div style="cursor: pointer; display: flex; flex-direction: column; align-items: center;">
          <div style="
            background: #0f172a; 
            border: 2px solid ${color}; 
            border-radius: 9999px; 
            padding: 3px 8px; 
            display: flex; 
            align-items: center; 
            gap: 4px; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          ">
            <span style="font-size: 13px;">💨</span>
            <div style="display: flex; flex-direction: column; line-height: 1;">
              <span style="font-size: 9px; color: #94a3b8; font-weight: 600;">ISPU</span>
              <span style="font-size: 13px; font-weight: 800; color: ${color};">${station.aqi}</span>
            </div>
          </div>
          <div style="
            margin-top: 2px;
            background: rgba(15, 23, 42, 0.85);
            color: #cbd5e1;
            font-size: 9px;
            font-weight: 600;
            padding: 1px 5px;
            border-radius: 4px;
            white-space: nowrap;
          ">
            ${station.stationName.replace('Stasiun ', '')}
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'aqi-marker-pin',
        html,
        iconSize: [60, 45],
        iconAnchor: [30, 38],
      });

      const marker = L.marker([station.latitude, station.longitude], { icon });

      const popupContent = document.createElement('div');
      popupContent.className = 'p-3 w-64 text-left';
      popupContent.innerHTML = `
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-slate-300">BMKG & DLHK Palembang</span>
          <span class="text-[10px] px-2 py-0.5 rounded font-bold" style="background:${color}; color:#fff">
            ${station.status}
          </span>
        </div>
        <h4 class="font-bold text-sm text-white mb-1">${station.stationName}</h4>
        <div class="grid grid-cols-2 gap-2 my-2 bg-slate-800/80 p-2 rounded-lg text-xs">
          <div>
            <span class="text-slate-400 block text-[10px]">Indeks ISPU</span>
            <span class="font-black text-base" style="color:${color}">${station.aqi}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[10px]">PM2.5</span>
            <span class="font-bold text-slate-200">${station.pm25} µg/m³</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[10px]">Cuaca</span>
            <span class="font-medium text-slate-200">${station.weather}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[10px]">Suhu / Lembap</span>
            <span class="font-medium text-slate-200">${station.temperature}°C / ${station.humidity}%</span>
          </div>
        </div>
        <p class="text-[11px] text-slate-400 mb-2">
          Kecamatan: ${station.district} • Diperbarui ${station.updatedAt}
        </p>
        <button id="btn-station-${station.id}" class="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium text-xs py-1.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-1">
          Buka Pantauan Lengkap Asap ➜
        </button>
      `;

      marker.bindPopup(popupContent, { maxWidth: 280 });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-station-${station.id}`);
        if (btn && onSelectStation) {
          btn.onclick = () => {
            onSelectStation(station);
          };
        }
      });

      marker.addTo(aqiLayer);
    });
  }, [airQualityStations, showAqiLayer, onSelectStation]);

  // Jump to location helper
  const jumpTo = (lat: number, lng: number, zoom = 14) => {
    mapInstanceRef.current?.flyTo([lat, lng], zoom, { duration: 1.2 });
  };

  return (
    <div className="relative w-full h-full">
      {/* Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Picking Location Banner Notification */}
      {isPickingLocation && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-amber-500 text-slate-950 font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border-2 border-white animate-bounce text-xs sm:text-sm">
          <Navigation className="w-4 h-4" />
          <span>Klik sembarang titik di peta untuk menandai lokasi kejadian!</span>
        </div>
      )}

      {/* Quick Jump Landmark Navigation */}
      <div className="absolute bottom-6 left-4 z-10 hidden sm:flex flex-wrap gap-1.5 max-w-md bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-slate-700/60 shadow-2xl">
        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block w-full px-1">
          Lompat Titik Ikonik Wong Kito:
        </span>
        <button
          onClick={() => jumpTo(-2.990934, 104.756554, 15)}
          className="text-xs font-semibold px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition"
        >
          🌉 Ampera
        </button>
        <button
          onClick={() => jumpTo(-2.9918, 104.7592, 16)}
          className="text-xs font-semibold px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition"
        >
          🏰 Kuto Besak (BKB)
        </button>
        <button
          onClick={() => jumpTo(-3.0205, 104.7877, 15)}
          className="text-xs font-semibold px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition"
        >
          🏟️ Jakabaring (JSC)
        </button>
        <button
          onClick={() => jumpTo(-2.9785, 104.756, 15)}
          className="text-xs font-semibold px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition"
        >
          🏙️ Sudirman / Cinde
        </button>
        <button
          onClick={() => jumpTo(-2.988, 104.7485, 16)}
          className="text-xs font-semibold px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition"
        >
          🌳 Kambang Iwak
        </button>
        <button
          onClick={() => jumpTo(-2.8988, 104.7032, 14)}
          className="text-xs font-semibold px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition"
        >
          ✈️ Bandara SMB II
        </button>
      </div>

      {/* Map Legend Floating Tag */}
      <div className="absolute bottom-6 right-4 z-10 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 text-[11px] text-slate-300 shadow-xl hidden md:flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse inline-block" />
          <span>Kriminalitas / Begal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
          <span>Kecelakaan</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" />
          <span>Banjir</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          <span>Event Kota</span>
        </div>
      </div>
    </div>
  );
};
