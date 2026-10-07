import React from 'react';
import {
  Wind,
  CloudRain,
  Sun,
  Thermometer,
  Droplets,
  AlertTriangle,
  ShieldCheck,
  Activity,
  Heart,
  Navigation,
} from 'lucide-react';
import { AirQualityStation } from '../types';

interface AirQualityPanelProps {
  stations: AirQualityStation[];
  onSelectStationOnMap: (station: AirQualityStation) => void;
  onClose?: () => void;
}

const getAqiDetails = (aqi: number) => {
  if (aqi <= 50) {
    return {
      status: 'BAIK',
      color: '#10b981',
      bgLight: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      badge: 'bg-emerald-950 text-emerald-300 border-emerald-800',
      description: 'Kadar polusi sangat rendah. Udara segar dan aman untuk segala aktivitas luar ruangan.',
      recommendation: 'Aman berolahraga di Kambang Iwak atau JSC Jakabaring tanpa masker.',
    };
  }
  if (aqi <= 100) {
    return {
      status: 'SEDANG',
      color: '#f59e0b',
      bgLight: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      badge: 'bg-amber-950 text-amber-300 border-amber-800',
      description: 'Kualitas udara masih dapat diterima. Sensitivitas ringan bagi sebagian kelompok rentan.',
      recommendation: 'Kelompok penderita asma dianjurkan membatasi aktivitas berat di luar ruangan.',
    };
  }
  if (aqi <= 150) {
    return {
      status: 'TIDAK SEHAT',
      color: '#ef4444',
      bgLight: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      badge: 'bg-red-950 text-red-300 border-red-800',
      description: 'Ada partikulat asap dan debu yang dapat mempengaruhi saluran pernapasan warga.',
      recommendation: 'Wajib gunakan masker jika berkendara motor atau beraktivitas di jalan protokol.',
    };
  }
  return {
    status: 'SANGAT TIDAK SEHAT',
    color: '#8b5cf6',
    bgLight: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    badge: 'bg-purple-950 text-purple-300 border-purple-800',
    description: 'Konsentrasi asap Karhutla tinggi. Berbahaya bagi kesehatan seluruh lapisan masyarakat.',
    recommendation: 'Hindari aktivitas luar ruangan. Nyalakan air purifier atau tutup ventilasi rumah.',
  };
};

export const AirQualityPanel: React.FC<AirQualityPanelProps> = ({
  stations,
  onSelectStationOnMap,
}) => {
  const avgAqi = Math.round(
    stations.reduce((acc, curr) => acc + curr.aqi, 0) / (stations.length || 1)
  );
  const generalStatus = getAqiDetails(avgAqi);

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
              <span className="text-xs uppercase font-bold tracking-wider text-cyan-400">
                Pusat Data BMKG & DLHK Palembang
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Indeks Standar Pencemar Udara (ISPU) & Asap Palembang
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
              Pemantauan partikulat PM2.5, asap kabut (haze), dan cuaca per-kecamatan secara aktual di seluruh penjuru Kota Palembang.
            </p>
          </div>

          {/* Average City AQI Gauge */}
          <div className="bg-slate-950/80 border border-slate-700/80 p-4 rounded-2xl flex items-center gap-4 shadow-xl">
            <div
              className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black shadow-inner"
              style={{ backgroundColor: generalStatus.color, color: '#0f172a' }}
            >
              <span className="text-[10px] uppercase font-bold">ISPU</span>
              <span className="text-2xl leading-none">{avgAqi}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">RATA-RATA KOTA</span>
              <span className="font-extrabold text-base text-white">{generalStatus.status}</span>
              <span className="text-[11px] text-slate-300 block">5 Stasiun Pemantau Aktif</span>
            </div>
          </div>
        </div>

        {/* Advisory ticker */}
        <div className={`mt-5 p-3 rounded-xl border ${generalStatus.border} ${generalStatus.bgLight} flex items-center gap-3 text-xs`}>
          <ShieldCheck className={`w-5 h-5 flex-shrink-0 ${generalStatus.text}`} />
          <div>
            <strong className="text-white">Panduan Kesehatan: </strong>
            <span className="text-slate-300">{generalStatus.recommendation}</span>
          </div>
        </div>
      </div>

      {/* Stations Breakdown Grid */}
      <div>
        <h3 className="font-bold text-base text-white mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" />
          <span>Pantauan Stasiun Sensor Per-Kecamatan</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stations.map((st) => {
            const details = getAqiDetails(st.aqi);
            return (
              <div
                key={st.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-lg transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-slate-400 truncate">
                      Kec. {st.district}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${details.badge}`}
                    >
                      {st.status}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-sm text-white mb-3">{st.stationName}</h4>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs mb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Indeks ISPU</span>
                      <span className="text-xl font-black" style={{ color: details.color }}>
                        {st.aqi}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">PM2.5</span>
                      <span className="text-base font-bold text-slate-200">{st.pm25} µg/m³</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Suhu Udara</span>
                      <span className="font-semibold text-slate-300 flex items-center gap-1">
                        <Thermometer className="w-3 h-3 text-red-400" />
                        {st.temperature}°C
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Kondisi Cuaca</span>
                      <span className="font-semibold text-slate-300 truncate">{st.weather}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                    {details.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Update {st.updatedAt}</span>
                  <button
                    onClick={() => onSelectStationOnMap(st)}
                    className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Lihat di Peta</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ISPU Scale Reference */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-xs">
        <h4 className="font-bold text-slate-200 mb-3 flex items-center gap-2">
          <span>Standar Kategori ISPU Kemenkes & KLHK:</span>
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <div className="bg-emerald-950/50 border border-emerald-800/50 p-2.5 rounded-xl text-center">
            <span className="font-bold text-emerald-400 block">0 - 50</span>
            <span className="font-black text-white text-[11px]">BAIK</span>
            <span className="text-[10px] text-slate-400 block mt-1">Aman & sehat</span>
          </div>
          <div className="bg-amber-950/50 border border-amber-800/50 p-2.5 rounded-xl text-center">
            <span className="font-bold text-amber-400 block">51 - 100</span>
            <span className="font-black text-white text-[11px]">SEDANG</span>
            <span className="text-[10px] text-slate-400 block mt-1">Sensitif ringan</span>
          </div>
          <div className="bg-red-950/50 border border-red-800/50 p-2.5 rounded-xl text-center">
            <span className="font-bold text-red-400 block">101 - 200</span>
            <span className="font-black text-white text-[11px]">TIDAK SEHAT</span>
            <span className="text-[10px] text-slate-400 block mt-1">Gunakan masker</span>
          </div>
          <div className="bg-purple-950/50 border border-purple-800/50 p-2.5 rounded-xl text-center">
            <span className="font-bold text-purple-400 block">201 - 300</span>
            <span className="font-black text-white text-[11px]">SANGAT TDK SEHAT</span>
            <span className="text-[10px] text-slate-400 block mt-1">Bahaya pernapasan</span>
          </div>
          <div className="bg-stone-950 border border-stone-800 p-2.5 rounded-xl text-center">
            <span className="font-bold text-amber-600 block">300+</span>
            <span className="font-black text-white text-[11px]">BERBAHAYA</span>
            <span className="text-[10px] text-slate-400 block mt-1">Darurat Karhutla</span>
          </div>
        </div>
      </div>
    </div>
  );
};
