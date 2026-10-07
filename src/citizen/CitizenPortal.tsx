/**
 * ==============================================================================
 * KODE WEBSITE USER BIASA (PORTAL WARGA KOTA PALEMBANG)
 * File: src/citizen/CitizenPortal.tsx
 * ==============================================================================
 * 
 * FUNGSI UTAMA:
 * - Menyajikan antarmuka interaktif publik untuk masyarakat umum Kota Palembang.
 * - Peta full-screen kejadian terkini (Begal/Kriminal, Kecelakaan, Macet, Banjir, Kebakaran, Event).
 * - Fitur "Lapor Kejadian Wong Kito" dengan deteksi GPS dan klik lokasi peta.
 * - Akses publik warta kota, pemantauan indeks polusi asap (ISPU/AQI), dan hotline darurat 112/110/113.
 * - Tanpa tombol kurasi internal ataupun kontrol instansi yang dapat membingungkan warga biasa.
 * - Dilengkapi tautan pengalihan bagi petugas yang ingin masuk ke Portal Admin.
 */

import React from 'react';
import { User } from 'firebase/auth';
import {
  IncidentReport,
  CityNews,
  AirQualityStation,
  ReportComment,
} from '../types';
import { PalembangMap } from '../components/PalembangMap';
import { Navbar } from '../components/Navbar';
import { IncidentDetailModal } from '../components/IncidentDetailModal';
import { ReportModal } from '../components/ReportModal';
import { AirQualityPanel } from '../components/AirQualityPanel';
import { NewsListModal } from '../components/NewsListModal';
import { EmergencyHotlinesModal } from '../components/EmergencyHotlinesModal';
import { Shield, ArrowRight } from 'lucide-react';

interface CitizenPortalProps {
  currentUser: User | null;
  incidents: IncidentReport[];
  newsList: CityNews[];
  airQualityStations: AirQualityStation[];
  comments: ReportComment[];
  activeTab: 'map' | 'news' | 'ispu' | 'hotlines';
  setActiveTab: (tab: 'map' | 'news' | 'ispu' | 'hotlines') => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  showAqiLayer: boolean;
  setShowAqiLayer: (val: boolean) => void;
  selectedIncident: IncidentReport | null;
  setSelectedIncident: (inc: IncidentReport | null) => void;
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;
  isPickingLocation: boolean;
  setIsPickingLocation: (picking: boolean) => void;
  pickedLocation: { lat: number; lng: number } | null;
  setPickedLocation: (coords: { lat: number; lng: number } | null) => void;
  onLogin: () => void;
  onLogout: () => void;
  onUpvote: (id: string) => void;
  onAddComment: (reportId: string, text: string) => void;
  onSubmitReport: (data: any) => Promise<void>;
  onSwitchToAdmin: () => void;
}

export const CitizenPortal: React.FC<CitizenPortalProps> = ({
  currentUser,
  incidents,
  newsList,
  airQualityStations,
  comments,
  activeTab,
  setActiveTab,
  selectedCategory,
  setSelectedCategory,
  showAqiLayer,
  setShowAqiLayer,
  selectedIncident,
  setSelectedIncident,
  isReportModalOpen,
  setIsReportModalOpen,
  isPickingLocation,
  setIsPickingLocation,
  pickedLocation,
  setPickedLocation,
  onLogin,
  onLogout,
  onUpvote,
  onAddComment,
  onSubmitReport,
  onSwitchToAdmin,
}) => {
  const averageAqi = Math.round(
    airQualityStations.reduce((a, b) => a + b.aqi, 0) / (airQualityStations.length || 1)
  );

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 
        NAVBAR WEBSITE WARGA
        Navigasi publik yang ramah pengguna dengan menu Peta, Berita, ISPU, dan Nomor Darurat.
      */}
      <Navbar
        currentUser={currentUser}
        isAdmin={false} // Selalu false di website warga biasa
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        showAqiLayer={showAqiLayer}
        setShowAqiLayer={setShowAqiLayer}
        pendingCount={0}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenAdminPanel={onSwitchToAdmin}
        onLogin={onLogin}
        onLogout={onLogout}
        averageAqi={averageAqi}
      />

      {/* 
        AREA KONTEN UTAMA PORTAL WARGA
      */}
      <main className="flex-1 relative overflow-hidden">
        {/* Tampilan 1: Peta Interaktif Full-Screen Kota Palembang */}
        {activeTab === 'map' && (
          <PalembangMap
            incidents={incidents}
            airQualityStations={airQualityStations}
            selectedCategory={selectedCategory}
            showAqiLayer={showAqiLayer}
            onSelectIncident={(inc) => setSelectedIncident(inc)}
            onSelectStation={() => setActiveTab('ispu')}
            isPickingLocation={isPickingLocation}
            pickedLocation={pickedLocation}
            onPickLocation={(coords) => {
              setPickedLocation(coords);
              setIsPickingLocation(false);
              setIsReportModalOpen(true);
            }}
          />
        )}

        {/* Tampilan 2: Warta & Agenda Event Kota Palembang */}
        {activeTab === 'news' && (
          <div className="w-full h-full overflow-y-auto">
            <NewsListModal
              newsList={newsList}
              onSelectNewsOnMap={(n) => {
                setActiveTab('map');
                const matched = incidents.find((i) => i.title === n.title);
                if (matched) setSelectedIncident(matched);
              }}
              isAdmin={false}
            />
          </div>
        )}

        {/* Tampilan 3: Indeks Asap & Stasiun Polusi ISPU BMKG */}
        {activeTab === 'ispu' && (
          <div className="w-full h-full overflow-y-auto">
            <AirQualityPanel
              stations={airQualityStations}
              onSelectStationOnMap={() => {
                setActiveTab('map');
                setShowAqiLayer(true);
              }}
            />
          </div>
        )}

        {/* Tampilan 4: Direktori Nomor Darurat Terpadu 112 / Damkar / Polisi / SAR */}
        {activeTab === 'hotlines' && (
          <div className="w-full h-full overflow-y-auto">
            <EmergencyHotlinesModal
              onFilterByAgency={(agency) => {
                setActiveTab('map');
                if (agency === 'POLRESTABES') setSelectedCategory('begal');
                else if (agency === 'DAMKAR') setSelectedCategory('kebakaran');
                else if (agency === 'DISHUB') setSelectedCategory('macet');
                else if (agency === 'SAR') setSelectedCategory('banjir');
              }}
            />
          </div>
        )}
      </main>

      {/* 
        PINTASAN MENU MENUJU PORTAL ADMIN / PETUGAS
        Diletakkan di sudut bawah dengan visual elegan sebagai pintu masuk petugas instansi.
      */}
      <div className="fixed bottom-3 right-3 z-30 flex items-center gap-2">
        <button
          onClick={onSwitchToAdmin}
          className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 text-amber-300 font-bold px-3 py-1.5 rounded-full border border-amber-500/40 shadow-2xl backdrop-blur-md text-xs transition transform hover:scale-105"
          title="Masuk ke dashboard kurasi dan kendali operasional petugas Palembang"
        >
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span>Portal Petugas / Admin</span>
          <ArrowRight className="w-3 h-3 text-amber-400" />
        </button>
      </div>

      {/* 
        MODAL RINCIAN KEJADIAN & KESAKSIAN WARGA
        Terbuka saat warga mengeklik pin kejadian di peta atau artikel berita.
      */}
      {selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          currentUser={currentUser}
          isAdmin={false}
          comments={comments.filter((c) => c.reportId === selectedIncident.id)}
          onClose={() => setSelectedIncident(null)}
          onUpvote={onUpvote}
          onAddComment={onAddComment}
        />
      )}

      {/* 
        MODAL FORMULIR PELAPORAN KEJADIAN REAL-TIME OLEH WARGA
      */}
      {isReportModalOpen && (
        <ReportModal
          currentUser={currentUser}
          pickedLocation={pickedLocation}
          onStartPickLocation={() => setIsPickingLocation(true)}
          onSubmitReport={onSubmitReport}
          onClose={() => setIsReportModalOpen(false)}
          onLogin={onLogin}
        />
      )}
    </div>
  );
};
