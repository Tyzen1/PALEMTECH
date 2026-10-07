/**
 * ==============================================================================
 * KODE WEBSITE USER ADMIN (PORTAL PUSAT KOMANDO & KURASI INSTANSI)
 * File: src/admin/AdminPortal.tsx
 * ==============================================================================
 * 
 * FUNGSI UTAMA:
 * - Menyajikan antarmuka tertutup & terkontrol bagi administrator dan petugas lintas instansi:
 *   (Polrestabes Palembang, Dinas Pemadam Kebakaran, Dishub, Basarnas, BMKG).
 * - Modul Kurasi Laporan Warga: Memverifikasi, menolak (hoaks/spam), menandai selesai,
 *   serta menambahkan disposisi / catatan resmi penanganan insiden.
 * - Modul Peta Pengawasan Taktis: Meninjau seluruh titik kejadian berdasarkan status kurasi.
 * - Modul Publikasi Berita & Agenda Resmi: Dilengkapi generator artikel AI Gemini.
 * - Modul Pembaruan Sensor ISPU Asap & BMKG: Memperbarui indeks mutu udara per kecamatan.
 * - Modul Metrik & Statistik: Rekapitulasi kecepatan tanggap dan distribusi kategori kejadian.
 * - Dilengkapi proteksi autentikasi akun admin (alexjun2306@gmail.com) serta bypass mode petugas untuk evaluasi.
 */

import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  IncidentReport,
  CityNews,
  AirQualityStation,
  ReportComment,
} from '../types';
import { PalembangMap } from '../components/PalembangMap';
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  FilePlus,
  Sparkles,
  BarChart3,
  Wind,
  Layers,
  ArrowLeft,
  LogIn,
  AlertTriangle,
  Building2,
  RefreshCw,
  Send,
  SlidersHorizontal,
} from 'lucide-react';

interface AdminPortalProps {
  currentUser: User | null;
  isAdmin: boolean;
  incidents: IncidentReport[];
  newsList: CityNews[];
  airQualityStations: AirQualityStation[];
  comments: ReportComment[];
  onLogin: () => void;
  onLogout: () => void;
  onActivateDemoAdmin: () => void;
  onSwitchToCitizen: () => void;
  onUpdateStatus: (id: string, status: 'verified' | 'rejected' | 'resolved', notes?: string) => Promise<void> | void;
  onCreateNews: (newsData: any) => Promise<void>;
  onUpdateStationAqi?: (stationId: string, newAqi: number, status: string, weather: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  currentUser,
  isAdmin,
  incidents,
  newsList,
  airQualityStations,
  comments,
  onLogin,
  onLogout,
  onActivateDemoAdmin,
  onSwitchToCitizen,
  onUpdateStatus,
  onCreateNews,
  onUpdateStationAqi,
}) => {
  // Navigasi sub-menu khusus admin
  const [adminSection, setAdminSection] = useState<'curation' | 'map' | 'news' | 'ispu' | 'stats'>('curation');
  const [curationFilter, setCurationFilter] = useState<'all' | 'pending' | 'verified' | 'resolved' | 'rejected'>('pending');
  const [curatorNotes, setCuratorNotes] = useState<Record<string, string>>({});
  
  // State form berita / agenda baru
  const [newsTitle, setNewsTitle] = useState('');
  const [newsCategory, setNewsCategory] = useState<'event' | 'darurat' | 'lalulintas' | 'lingkungan' | 'himbauan'>('event');
  const [newsAgency, setNewsAgency] = useState('POLRESTABES PALEMBANG');
  const [newsLocation, setNewsLocation] = useState('Benteng Kuto Besak (BKB)');
  const [newsNotes, setNewsNotes] = useState('');
  const [newsSummary, setNewsSummary] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsImageUrl, setNewsImageUrl] = useState('');
  const [pinOnMap, setPinOnMap] = useState(true);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isSubmittingNews, setIsSubmittingNews] = useState(false);

  // State update stasiun ISPU
  const [selectedStationId, setSelectedStationId] = useState<string>(airQualityStations[0]?.id || '');
  const [newAqiVal, setNewAqiVal] = useState<number>(65);
  const [newWeatherVal, setNewWeatherVal] = useState<string>('Cerah Berawan');

  // Filter laporan kurasi
  const pendingCount = incidents.filter((r) => r.status === 'pending').length;
  const filteredReports = incidents.filter((r) => {
    if (curationFilter === 'all') return true;
    return r.status === curationFilter;
  });

  // Handler Generate Berita dengan AI Gemini
  const handleAiWriteNews = async () => {
    if (!newsTitle.trim()) {
      alert('Tuliskan judul berita atau topik rilis terlebih dahulu.');
      return;
    }
    setIsAiGenerating(true);
    try {
      const res = await fetch('/api/ai-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newsTitle,
          category: newsCategory,
          notes: newsNotes || 'Rilis pers resmi untuk seluruh warga Kota Palembang.',
          locationName: newsLocation,
          agency: newsAgency,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setNewsSummary(data.summary || '');
        setNewsContent(data.content || '');
      }
    } catch (err) {
      console.warn('AI generator note:', err);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Handler Submit Berita Resmi
  const handleSubmitNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle.trim() || !newsSummary.trim() || !newsContent.trim()) {
      alert('Mohon lengkapi judul, ringkasan, dan naskah berita.');
      return;
    }
    setIsSubmittingNews(true);
    try {
      await onCreateNews({
        title: newsTitle.trim(),
        summary: newsSummary.trim(),
        content: newsContent.trim(),
        category: newsCategory,
        imageUrl: newsImageUrl.trim() || undefined,
        locationName: newsLocation.trim(),
        agency: newsAgency,
        pinOnMap,
      });
      alert('Berita resmi berhasil dipublikasikan!');
      setNewsTitle('');
      setNewsSummary('');
      setNewsContent('');
      setNewsNotes('');
      setAdminSection('curation');
    } catch (err) {
      console.error(err);
      alert('Gagal mempublikasikan berita.');
    } finally {
      setIsSubmittingNews(false);
    }
  };

  /* 
    PROTEKSI AKSES / GATEKEEPER ADMIN:
    Jika pengguna belum masuk sebagai akun admin resmi atau belum mengaktifkan mode petugas.
  */
  if (!isAdmin) {
    return (
      <div className="min-h-screen w-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="max-w-md w-full bg-slate-900 border border-amber-500/30 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/40 text-2xl font-black">
            🛡️
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Portal Khusus Petugas & Admin</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Area ini dibatasi khusus untuk verifikator laporan warga, kurasi instansi (Polrestabes, Damkar, SAR, Dishub), serta editor agenda Pemkot Palembang.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left text-xs space-y-2">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
              Akun Administrator Terdaftar:
            </span>
            <div className="text-slate-300 font-mono text-[11px] bg-slate-900 p-2 rounded-lg border border-slate-700">
              alexjun2306@gmail.com
            </div>
            <p className="text-[11px] text-slate-400">
              Silakan masuk menggunakan akun Google Anda yang memiliki hak akses administratif.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={onLogin}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk dengan Google (Akun Admin)</span>
            </button>

            <button
              onClick={onActivateDemoAdmin}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs rounded-xl border border-amber-500/30 transition flex items-center justify-center gap-2"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Aktivasi Akses Petugas (Demo Test Mode)</span>
            </button>

            <button
              onClick={onSwitchToCitizen}
              className="w-full py-2 text-slate-400 hover:text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 pt-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Website Warga Biasa</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* 
    TAMPILAN UTAMA DASHBOARD PUSAT KOMANDO ADMIN
  */
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 
        HEADER DASHBOARD ADMIN
      */}
      <header className="bg-slate-900 border-b border-slate-800 px-5 py-3 flex items-center justify-between gap-4 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-red-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
            🛡️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-base sm:text-lg tracking-tight text-white">
                PUSAT KOMANDO SIAGA <span className="text-amber-400">ADMIN</span>
              </h1>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600">
                Instansi Terhubung
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Panel Kurasi, Disposisi Darurat Lintas Sektor, dan Publikasi Warta Kota Palembang
            </p>
          </div>
        </div>

        {/* Tab Navigasi Admin */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setAdminSection('curation')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              adminSection === 'curation'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Kurasi Laporan</span>
            {pendingCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setAdminSection('map')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              adminSection === 'map'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Peta Taktis</span>
          </button>

          <button
            onClick={() => setAdminSection('news')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              adminSection === 'news'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FilePlus className="w-3.5 h-3.5" />
            <span>Publikasi Berita (AI)</span>
          </button>

          <button
            onClick={() => setAdminSection('ispu')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              adminSection === 'ispu'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Sensor ISPU Asap</span>
          </button>

          <button
            onClick={() => setAdminSection('stats')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              adminSection === 'stats'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Metrik & Rekap</span>
          </button>
        </nav>

        {/* Tombol Kembali ke Website Warga */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSwitchToCitizen}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs px-3.5 py-2 rounded-xl border border-amber-500/30 shadow transition"
            title="Keluar dari mode admin dan buka tampilan publik warga"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Website Warga</span>
          </button>

          <button
            onClick={onLogout}
            className="text-xs text-slate-400 hover:text-red-400 font-semibold px-2 py-1 transition"
          >
            Keluar
          </button>
        </div>
      </header>

      {/* Navigasi Mobile Tab Admin */}
      <div className="md:hidden flex border-b border-slate-800 bg-slate-900 text-xs overflow-x-auto no-scrollbar">
        <button
          onClick={() => setAdminSection('curation')}
          className={`px-3 py-2 whitespace-nowrap font-bold ${
            adminSection === 'curation' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-400'
          }`}
        >
          Kurasi ({pendingCount})
        </button>
        <button
          onClick={() => setAdminSection('map')}
          className={`px-3 py-2 whitespace-nowrap font-bold ${
            adminSection === 'map' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-400'
          }`}
        >
          Peta Taktis
        </button>
        <button
          onClick={() => setAdminSection('news')}
          className={`px-3 py-2 whitespace-nowrap font-bold ${
            adminSection === 'news' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-400'
          }`}
        >
          Buat Berita
        </button>
        <button
          onClick={() => setAdminSection('ispu')}
          className={`px-3 py-2 whitespace-nowrap font-bold ${
            adminSection === 'ispu' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-400'
          }`}
        >
          Sensor ISPU
        </button>
        <button
          onClick={() => setAdminSection('stats')}
          className={`px-3 py-2 whitespace-nowrap font-bold ${
            adminSection === 'stats' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-400'
          }`}
        >
          Metrik
        </button>
      </div>

      {/* 
        AREA KERJA KONTEN KHUSUS ADMIN
      */}
      <div className="flex-1 overflow-hidden relative">
        {/* SUB-MENU 1: KURASI LAPORAN WARGA (TRIAGE) */}
        {adminSection === 'curation' && (
          <div className="h-full overflow-y-auto p-4 sm:p-6 max-w-6xl mx-auto space-y-5">
            {/* Filter Bar Kurasi */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" /> Filter Antrean:
                </span>
                {[
                  { id: 'pending', label: `Menunggu Kurasi (${pendingCount})`, badge: 'text-amber-400' },
                  { id: 'verified', label: 'Terverifikasi', badge: 'text-emerald-400' },
                  { id: 'resolved', label: 'Selesai / Ditangani', badge: 'text-blue-400' },
                  { id: 'rejected', label: 'Ditolak / Hoaks', badge: 'text-red-400' },
                  { id: 'all', label: 'Semua Status', badge: 'text-slate-300' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setCurationFilter(f.id as any)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition border ${
                      curationFilter === f.id
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="text-xs text-slate-400">
                Menampilkan <strong>{filteredReports.length}</strong> laporan
              </div>
            </div>

            {/* List Kartu Kurasi Laporan */}
            {filteredReports.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 p-12 rounded-3xl text-center text-slate-400">
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                <h3 className="font-bold text-base text-white">Tidak ada laporan pada kategori ini</h3>
                <p className="text-xs text-slate-400 mt-1">Antrean kurasi bersih.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className={`bg-slate-900 rounded-2xl border p-5 shadow-xl transition space-y-4 ${
                      report.status === 'pending'
                        ? 'border-amber-500/60 bg-gradient-to-r from-slate-900 to-amber-950/20'
                        : 'border-slate-800'
                    }`}
                  >
                    {/* Header bar laporan */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-800 text-amber-300 border border-slate-700">
                          {report.category}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            report.status === 'verified'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                              : report.status === 'resolved'
                              ? 'bg-blue-950 text-blue-300 border border-blue-600'
                              : report.status === 'rejected'
                              ? 'bg-red-950 text-red-300 border border-red-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-600 animate-pulse'
                          }`}
                        >
                          Status: {report.status}
                        </span>
                        <span className="text-xs text-slate-400">
                          Tingkat Keparahan: <strong className="text-white uppercase">{report.severity}</strong>
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{new Date(report.createdAt).toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    {/* Judul & Narasi Kejadian */}
                    <div className="space-y-1.5">
                      <h3 className="font-extrabold text-base text-white">{report.title}</h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                        {report.description}
                      </p>
                    </div>

                    {/* Lokasi & Pelapor */}
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-300">
                      <div className="flex items-center gap-1.5 text-amber-400">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="font-semibold">{report.address}</span>
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        Pelapor: <strong className="text-slate-200">{report.reporterName}</strong> ({report.reporterEmail || 'Warga Anonim'})
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        Disposisi Instansi: <strong className="text-amber-300">{report.agency}</strong>
                      </div>
                    </div>

                    {/* Catatan kurator yang sudah tersimpan */}
                    {report.curatorNotes && (
                      <div className="bg-blue-950/30 border border-blue-500/40 p-3 rounded-xl text-xs text-blue-200">
                        <strong>📌 Catatan Petugas Tertera: </strong>
                        <span>{report.curatorNotes}</span>
                      </div>
                    )}

                    {/* Area Aksi Moderasi Admin */}
                    <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="text"
                        placeholder="Ketik catatan kurator / instruksi posko (contoh: Unit Damkar Pos Gandus meluncur)..."
                        value={curatorNotes[report.id] || ''}
                        onChange={(e) =>
                          setCuratorNotes({ ...curatorNotes, [report.id]: e.target.value })
                        }
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            onUpdateStatus(report.id, 'verified', curatorNotes[report.id])
                          }
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow transition"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Verifikasi & Terbitkan</span>
                        </button>

                        <button
                          onClick={() =>
                            onUpdateStatus(report.id, 'resolved', curatorNotes[report.id])
                          }
                          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow transition"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Selesai</span>
                        </button>

                        <button
                          onClick={() =>
                            onUpdateStatus(report.id, 'rejected', curatorNotes[report.id])
                          }
                          className="px-3 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow transition ml-auto"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Tolak (Hoaks)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SUB-MENU 2: PETA PENGAWASAN TAKTIS ADMIN */}
        {adminSection === 'map' && (
          <div className="w-full h-full relative">
            <PalembangMap
              incidents={incidents}
              airQualityStations={airQualityStations}
              selectedCategory="all"
              showAqiLayer={true}
              onSelectIncident={(inc) => {
                alert(`Insiden: ${inc.title}\nStatus: ${inc.status}\nAlamat: ${inc.address}`);
              }}
            />
            {/* Overlay Banner Taktis */}
            <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-700 shadow-2xl text-xs text-slate-300 max-w-sm">
              <span className="font-bold text-amber-400 block mb-0.5">🗺️ Mode Peta Pengawasan Taktis:</span>
              <span>Menampilkan seluruh titik insiden aktif, status kurasi, dan stasiun ISPU se-Kota Palembang secara real-time.</span>
            </div>
          </div>
        )}

        {/* SUB-MENU 3: PEMBUAT BERITA & EVENT RESMI DENGAN AI GEMINI */}
        {adminSection === 'news' && (
          <div className="h-full overflow-y-auto p-4 sm:p-6 max-w-4xl mx-auto space-y-5">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-base text-white">
                    Publikasi Berita, Rekayasa Lalulintas & Agenda Event Kota
                  </h2>
                  <p className="text-xs text-slate-400">
                    Gunakan kecerdasan AI Gemini untuk membuat rilis berita instansi dan pengumuman resmi warga secara instan.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmitNews} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Judul Agenda / Berita:</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Parade Bidar Tradisional HUT RI di Sungai Musi"
                      value={newsTitle}
                      onChange={(e) => setNewsTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Kategori:</label>
                    <select
                      value={newsCategory}
                      onChange={(e) => setNewsCategory(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="event">🎉 Agenda Event / Festival Kebudayaan</option>
                      <option value="lalulintas">🚗 Rekayasa Lalulintas / Penutupan Jalur</option>
                      <option value="lingkungan">💨 Peringatan Cuaca & Asap BMKG</option>
                      <option value="himbauan">👮 Himbauan Kamtibmas Kepolisian</option>
                      <option value="darurat">🚨 Kondisi Darurat</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Instansi Penanggung Jawab:</label>
                    <input
                      type="text"
                      placeholder="Disbudpar / Dishub Palembang / Polrestabes"
                      value={newsAgency}
                      onChange={(e) => setNewsAgency(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Titik Lokasi di Palembang:</label>
                    <input
                      type="text"
                      placeholder="Benteng Kuto Besak / Jembatan Ampera / Kambang Iwak"
                      value={newsLocation}
                      onChange={(e) => setNewsLocation(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Generator AI Gemini */}
                <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Bantu Tulis Artikel dengan AI Gemini:</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAiWriteNews}
                      disabled={isAiGenerating}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-slate-950 font-black rounded-lg text-xs shadow transition flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isAiGenerating ? 'Menulis...' : 'Generate Artikel Lengkap'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Masukkan poin-poin singkat: jadwal penutupan jalan, rute alternatif, kantong parkir, imbauan Kapolrestabes..."
                    value={newsNotes}
                    onChange={(e) => setNewsNotes(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Ringkasan Berita:</label>
                  <input
                    type="text"
                    required
                    placeholder="1-2 kalimat pengantar untuk kartu berita..."
                    value={newsSummary}
                    onChange={(e) => setNewsSummary(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Isi Lengkap Rilis Pers:</label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Naskah lengkap rilis..."
                    value={newsContent}
                    onChange={(e) => setNewsContent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">URL Gambar Sampul (Opsional):</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={newsImageUrl}
                      onChange={(e) => setNewsImageUrl(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="pt-4">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-300">
                      <input
                        type="checkbox"
                        checked={pinOnMap}
                        onChange={(e) => setPinOnMap(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700"
                      />
                      <span>Tampilkan pin lokasi resmi di peta kota</span>
                    </label>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingNews}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmittingNews ? 'Menerbitkan...' : 'Terbitkan Sekarang'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SUB-MENU 4: SENSOR ISPU & CUACA BMKG */}
        {adminSection === 'ispu' && (
          <div className="h-full overflow-y-auto p-4 sm:p-6 max-w-4xl mx-auto space-y-5">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Wind className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-base text-white">
                    Pembaruan Data Sensor ISPU & Stasiun Cuaca BMKG
                  </h2>
                  <p className="text-xs text-slate-400">
                    Petugas DLHK dan BMKG dapat memperbarui indeks pencemaran asap secara berkala.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1 text-xs">Pilih Stasiun:</label>
                  <select
                    value={selectedStationId}
                    onChange={(e) => setSelectedStationId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {airQualityStations.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.stationName} ({st.district})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1 text-xs">Indeks ISPU (AQI):</label>
                  <input
                    type="number"
                    value={newAqiVal}
                    onChange={(e) => setNewAqiVal(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1 text-xs">Kondisi Cuaca BMKG:</label>
                  <input
                    type="text"
                    value={newWeatherVal}
                    onChange={(e) => setNewWeatherVal(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  const status =
                    newAqiVal <= 50
                      ? 'BAIK'
                      : newAqiVal <= 100
                      ? 'SEDANG'
                      : newAqiVal <= 200
                      ? 'TIDAK_SEHAT'
                      : 'BERBAHAYA';
                  if (onUpdateStationAqi) {
                    onUpdateStationAqi(selectedStationId, newAqiVal, status, newWeatherVal);
                  }
                  alert('Data stasiun pemantau berhasil diperbarui!');
                }}
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow transition"
              >
                Simpan & Sinkronisasi Sensor
              </button>
            </div>
          </div>
        )}

        {/* SUB-MENU 5: METRIK & REKAPITULASI PENANGANAN KOTA */}
        {adminSection === 'stats' && (
          <div className="h-full overflow-y-auto p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Laporan Warga</span>
                <span className="text-3xl font-black text-white mt-1 block">{incidents.length}</span>
                <span className="text-[11px] text-slate-500 block mt-1">Sejak sistem aktif</span>
              </div>

              <div className="bg-slate-900 border border-amber-500/40 p-5 rounded-2xl">
                <span className="text-[10px] font-bold text-amber-400 block uppercase">Menunggu Kurasi</span>
                <span className="text-3xl font-black text-amber-400 mt-1 block">{pendingCount}</span>
                <span className="text-[11px] text-slate-400 block mt-1">Perlu tindakan petugas</span>
              </div>

              <div className="bg-slate-900 border border-emerald-500/40 p-5 rounded-2xl">
                <span className="text-[10px] font-bold text-emerald-400 block uppercase">Terverifikasi</span>
                <span className="text-3xl font-black text-emerald-400 mt-1 block">
                  {incidents.filter((i) => i.status === 'verified').length}
                </span>
                <span className="text-[11px] text-slate-400 block mt-1">Tayang pada peta publik</span>
              </div>

              <div className="bg-slate-900 border border-blue-500/40 p-5 rounded-2xl">
                <span className="text-[10px] font-bold text-blue-400 block uppercase">Selesai Ditangani</span>
                <span className="text-3xl font-black text-blue-400 mt-1 block">
                  {incidents.filter((i) => i.status === 'resolved').length}
                </span>
                <span className="text-[11px] text-slate-400 block mt-1">Evakuasi & respon tuntas</span>
              </div>
            </div>

            {/* Rekap Distribusi Kategori */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h3 className="font-extrabold text-sm text-white">Distribusi Kategori Kejadian di Palembang</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {[
                  { cat: 'begal', label: 'Begal / Kriminal', color: 'bg-red-500' },
                  { cat: 'kecelakaan', label: 'Kecelakaan Lalu Lintas', color: 'bg-orange-500' },
                  { cat: 'macet', label: 'Titik Kemacetan', color: 'bg-yellow-500' },
                  { cat: 'banjir', label: 'Genangan / Banjir', color: 'bg-cyan-500' },
                  { cat: 'kebakaran', label: 'Kebakaran (Damkar)', color: 'bg-red-600' },
                  { cat: 'event', label: 'Event & Festival', color: 'bg-emerald-500' },
                ].map((item) => {
                  const count = incidents.filter((i) => i.category === item.cat).length;
                  return (
                    <div key={item.cat} className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-400">{item.label}</span>
                        <span className="font-black text-white">{count}</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color}`}
                          style={{ width: `${Math.min(100, count * 15)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
