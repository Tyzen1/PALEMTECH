import React from 'react';
import { User } from 'firebase/auth';
import {
  ShieldAlert,
  Flame,
  PlusCircle,
  Wind,
  PhoneCall,
  FileText,
  SlidersHorizontal,
  LogIn,
  LogOut,
  MapPin,
  CheckCircle2,
  Bell,
  Sparkles,
} from 'lucide-react';
import { IncidentCategory } from '../types';

interface NavbarProps {
  currentUser: User | null;
  isAdmin: boolean;
  activeTab: 'map' | 'news' | 'ispu' | 'hotlines';
  setActiveTab: (tab: 'map' | 'news' | 'ispu' | 'hotlines') => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  showAqiLayer: boolean;
  setShowAqiLayer: (val: boolean) => void;
  pendingCount: number;
  onOpenReportModal: () => void;
  onOpenAdminPanel: () => void;
  onLogin: () => void;
  onLogout: () => void;
  averageAqi: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  isAdmin,
  activeTab,
  setActiveTab,
  selectedCategory,
  setSelectedCategory,
  showAqiLayer,
  setShowAqiLayer,
  pendingCount,
  onOpenReportModal,
  onOpenAdminPanel,
  onLogin,
  onLogout,
  averageAqi,
}) => {
  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 text-slate-100 shadow-xl">
      {/* Top Bar: Emergency Ticker & Weather/ISPU */}
      <div className="bg-slate-950 px-4 py-1.5 border-b border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="font-bold text-amber-400">INFO SIAGA PALEMBANG:</span>
          <span className="text-slate-300 truncate">
            Hotline Darurat 24 Jam: <strong>112 (Siaga Kota)</strong> • <strong>110 (Polrestabes)</strong> • <strong>113 (Damkar)</strong>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-4 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span>🌡️ Cuaca Palembang:</span>
            <strong className="text-slate-200">31°C Cerah Berawan</strong>
          </div>
          <div className="flex items-center gap-1.5">
            <Wind className="w-3.5 h-3.5 text-cyan-400" />
            <span>Rata-rata ISPU:</span>
            <strong className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
              averageAqi <= 50 ? 'bg-emerald-900/60 text-emerald-300' :
              averageAqi <= 100 ? 'bg-amber-900/60 text-amber-300' : 'bg-red-900/60 text-red-300'
            }`}>
              {averageAqi} ({averageAqi <= 50 ? 'BAIK' : averageAqi <= 100 ? 'SEDANG' : 'TIDAK SEHAT'})
            </strong>
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Logo & Identity */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('map')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-red-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 font-black text-xl">
            🌉
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-base md:text-lg tracking-tight text-white flex items-center gap-1.5">
                PALEMBANG <span className="text-amber-400">SIAGA</span>
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Peta Wong Kito
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Pantau Begal, Banjir, Macet, Damkar, Event & Polusi Realtime
            </p>
          </div>
        </div>

        {/* Center Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === 'map'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Peta Kejadian</span>
          </button>

          <button
            onClick={() => setActiveTab('news')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === 'news'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Berita & Event Kota</span>
          </button>

          <button
            onClick={() => setActiveTab('ispu')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === 'ispu'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Indeks Asap & ISPU</span>
          </button>

          <button
            onClick={() => setActiveTab('hotlines')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === 'hotlines'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Kontak Darurat</span>
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Lapor Button */}
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm px-3.5 py-2 rounded-xl shadow-lg shadow-red-600/30 transition transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Lapor Kejadian</span>
          </button>

          {/* Admin Kurasi Button */}
          {isAdmin && (
            <button
              onClick={onOpenAdminPanel}
              className="relative flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs px-3 py-2 rounded-xl border border-amber-500/40 shadow transition"
              title="Panel Kurasi & Publikasi Berita"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Kurasi Admin</span>
              {pendingCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full ml-1">
                  {pendingCount}
                </span>
              )}
            </button>
          )}

          {/* User Sign In / Profile */}
          {currentUser ? (
            <div className="flex items-center gap-2 bg-slate-800/80 p-1 pl-2.5 rounded-xl border border-slate-700 text-xs">
              <div className="flex flex-col text-right leading-tight max-w-[100px] truncate">
                <span className="font-bold text-slate-200 truncate">{currentUser.displayName || 'Wong Kito'}</span>
                <span className="text-[10px] text-amber-400">{isAdmin ? 'Admin' : 'Pelapor'}</span>
              </div>
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="Avatar"
                  className="w-7 h-7 rounded-lg object-cover border border-amber-500/50"
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-900 font-bold flex items-center justify-center">
                  {(currentUser.displayName || 'W')[0]}
                </div>
              )}
              <button
                onClick={onLogout}
                title="Keluar"
                className="p-1 hover:text-red-400 transition text-slate-400"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 transition"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Masuk Google</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Pills & Mobile Navigation Sub-bar */}
      {activeTab === 'map' && (
        <div className="px-4 py-2 bg-slate-950/70 border-t border-slate-800/70 flex items-center justify-between gap-2 overflow-x-auto text-xs no-scrollbar">
          <div className="flex items-center gap-1.5 flex-nowrap">
            <span className="text-slate-400 font-semibold text-[11px] whitespace-nowrap mr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3 text-amber-400" /> Filter:
            </span>

            {[
              { id: 'all', label: 'Semua Titik', icon: '📍' },
              { id: 'begal', label: 'Begal / Kriminal', icon: '🚨' },
              { id: 'kecelakaan', label: 'Kecelakaan', icon: '💥' },
              { id: 'macet', label: 'Titik Macet', icon: '🚗' },
              { id: 'banjir', label: 'Banjir / Genangan', icon: '🌊' },
              { id: 'kebakaran', label: 'Kebakaran', icon: '🔥' },
              { id: 'demo', label: 'Demo / Aksi', icon: '📢' },
              { id: 'event', label: 'Event Kota', icon: '🎉' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1 transition ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Toggle ISPU / Asap Layer on Map */}
          <div className="flex items-center gap-2 pl-3 border-l border-slate-800 whitespace-nowrap">
            <button
              onClick={() => setShowAqiLayer(!showAqiLayer)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                showAqiLayer
                  ? 'bg-cyan-600 text-white shadow font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
              }`}
            >
              <Wind className="w-3.5 h-3.5" />
              <span>Layer ISPU Asap ({showAqiLayer ? 'ON' : 'OFF'})</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Tabs if on small screens */}
      <div className="lg:hidden flex border-t border-slate-800 bg-slate-950 text-xs">
        <button
          onClick={() => setActiveTab('map')}
          className={`flex-1 py-2 text-center font-semibold ${
            activeTab === 'map' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-400'
          }`}
        >
          🗺️ Peta
        </button>
        <button
          onClick={() => setActiveTab('news')}
          className={`flex-1 py-2 text-center font-semibold ${
            activeTab === 'news' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-400'
          }`}
        >
          📰 Berita/Event
        </button>
        <button
          onClick={() => setActiveTab('ispu')}
          className={`flex-1 py-2 text-center font-semibold ${
            activeTab === 'ispu' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-400'
          }`}
        >
          💨 ISPU Asap
        </button>
        <button
          onClick={() => setActiveTab('hotlines')}
          className={`flex-1 py-2 text-center font-semibold ${
            activeTab === 'hotlines' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-400'
          }`}
        >
          🚨 Kontak
        </button>
      </div>
    </header>
  );
};
