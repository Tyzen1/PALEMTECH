import React from 'react';
import {
  PhoneCall,
  ShieldAlert,
  Flame,
  LifeBuoy,
  Car,
  CloudRain,
  Hospital,
  AlertOctagon,
  X,
  ExternalLink,
} from 'lucide-react';
import { EMERGENCY_CONTACTS } from '../data/seedData';
import { AgencyType } from '../types';

interface EmergencyHotlinesModalProps {
  onClose?: () => void;
  onFilterByAgency?: (agency: AgencyType) => void;
}

export const EmergencyHotlinesModal: React.FC<EmergencyHotlinesModalProps> = ({
  onClose,
  onFilterByAgency,
}) => {
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6 text-slate-100">
      {/* Banner */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 border border-red-500/30 rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs uppercase font-bold tracking-wider text-red-400">
                Pusat Tanggap Darurat Wong Kito 24 Jam
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Nomor Darurat & Kerjasama Instansi Kota Palembang
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Hubungi instansi siaga terdekat secara langsung jika Anda atau warga sekitar mengalami keadaan darurat kriminalitas, kebakaran, musibah Sungai Musi, atau kecelakaan.
            </p>
          </div>

          <div className="bg-red-600/20 border border-red-500/40 p-4 rounded-2xl text-center self-start sm:self-auto">
            <span className="text-[10px] uppercase font-bold text-red-300 block">PANGGILAN DARURAT BEBAS PULSA</span>
            <span className="text-3xl font-black text-red-400">112</span>
            <span className="text-[10px] text-slate-300 block">Palembang Siaga</span>
          </div>
        </div>
      </div>

      {/* Grid of Agencies */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {EMERGENCY_CONTACTS.map((item, idx) => (
          <div
            key={idx}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl">
                  {item.agency === 'POLRESTABES' && '👮'}
                  {item.agency === 'DAMKAR' && '🚒'}
                  {item.agency === 'SAR' && '🛟'}
                  {item.agency === 'DISHUB' && '🚦'}
                  {item.agency === 'BMKG' && '🌩️'}
                  {item.agency === 'UMUM' && '🚨'}
                </span>

                <span className="text-xs font-black px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  {item.shortNumber}
                </span>
              </div>

              <h4 className="font-extrabold text-sm sm:text-base text-white mb-1">{item.name}</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">{item.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-2">
              <a
                href={`tel:${item.phone}`}
                className="w-full py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Panggil Sekarang: {item.phone}</span>
              </a>

              {onFilterByAgency && (
                <button
                  onClick={() => onFilterByAgency(item.agency)}
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[11px] rounded-lg transition"
                >
                  Pantau Titik Laporan {item.agency} di Peta
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Hospital and Additional Essential Hotlines */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-xs space-y-3">
        <h4 className="font-bold text-slate-200 flex items-center gap-2">
          <Hospital className="w-4 h-4 text-emerald-400" />
          <span>Fasilitas Medis & IGD Rujukan Utama Palembang:</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <strong className="block text-slate-200">RSUP Dr. Mohammad Hoesin (RSMH)</strong>
            <span className="text-slate-400 text-[11px] block mt-0.5">Jl. Jend. Sudirman KM 3.5</span>
            <span className="text-amber-400 font-bold block mt-1">IGD: 0711-354088</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <strong className="block text-slate-200">RS Siloam Sriwijaya</strong>
            <span className="text-slate-400 text-[11px] block mt-0.5">Jl. POM IX, Lorok Pakjo</span>
            <span className="text-amber-400 font-bold block mt-1">IGD: 0711-5229111</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <strong className="block text-slate-200">PMI Kota Palembang (Ambulans)</strong>
            <span className="text-slate-400 text-[11px] block mt-0.5">Markas Palang Merah</span>
            <span className="text-amber-400 font-bold block mt-1">Telp: 0711-350005</span>
          </div>
        </div>
      </div>
    </div>
  );
};
