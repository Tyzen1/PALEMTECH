import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  X,
  ShieldCheck,
  CheckCircle,
  XCircle,
  FilePlus,
  Sparkles,
  MapPin,
  Calendar,
  Building2,
  Clock,
  Eye,
  Send,
  AlertOctagon,
} from 'lucide-react';
import { IncidentReport, CityNews, IncidentCategory } from '../types';

interface AdminCurationPanelProps {
  currentUser: User | null;
  reports: IncidentReport[];
  onClose: () => void;
  onUpdateStatus: (id: string, status: 'verified' | 'rejected' | 'resolved', notes?: string) => void;
  onCreateNews: (newsData: {
    title: string;
    summary: string;
    content: string;
    category: 'event' | 'darurat' | 'lalulintas' | 'lingkungan' | 'himbauan';
    imageUrl?: string;
    locationName?: string;
    latitude?: number;
    longitude?: number;
    agency: string;
    pinOnMap: boolean;
  }) => Promise<void>;
}

export const AdminCurationPanel: React.FC<AdminCurationPanelProps> = ({
  currentUser,
  reports,
  onClose,
  onUpdateStatus,
  onCreateNews,
}) => {
  const [activeTab, setActiveTab] = useState<'curate' | 'createNews'>('curate');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [curatorNotes, setCuratorNotes] = useState<Record<string, string>>({});

  // Form state for creating news / event
  const [newsTitle, setNewsTitle] = useState('');
  const [newsCategory, setNewsCategory] = useState<'event' | 'darurat' | 'lalulintas' | 'lingkungan' | 'himbauan'>('event');
  const [newsAgency, setNewsAgency] = useState('PEMKOT PALEMBANG');
  const [newsLocation, setNewsLocation] = useState('Benteng Kuto Besak (BKB)');
  const [newsImageUrl, setNewsImageUrl] = useState('');
  const [newsNotes, setNewsNotes] = useState('');
  const [newsSummary, setNewsSummary] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [pinOnMap, setPinOnMap] = useState(true);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isSubmittingNews, setIsSubmittingNews] = useState(false);

  const pendingReports = reports.filter((r) => r.status === 'pending');
  const otherReports = reports.filter((r) => r.status !== 'pending');

  const handleAiWriteNews = async () => {
    if (!newsTitle.trim()) {
      alert('Masukkan judul berita atau agenda terlebih dahulu.');
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
          notes: newsNotes || 'Pengumuman resmi untuk seluruh masyarakat Kota Palembang.',
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
      console.warn('AI news generation error:', err);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleSubmitNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle.trim() || !newsSummary.trim() || !newsContent.trim()) {
      alert('Lengkapi judul, ringkasan, dan isi berita.');
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
      setActiveTab('curate');
      setNewsTitle('');
      setNewsSummary('');
      setNewsContent('');
      setNewsNotes('');
    } catch (err) {
      console.error('Failed to create news:', err);
      alert('Gagal mempublikasikan berita.');
    } finally {
      setIsSubmittingNews(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-10 backdrop-blur">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black border border-amber-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                Panel Kurasi Admin & Publikasi Kota
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  Petugas
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Verifikasi laporan warga, kurasi hoaks/spam, dan buat rilis resmi acara Palembang
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('curate')}
            className={`py-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'curate'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Kurasi Laporan Warga ({pendingReports.length} Menunggu)</span>
          </button>

          <button
            onClick={() => setActiveTab('createNews')}
            className={`py-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'createNews'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FilePlus className="w-4 h-4" />
            <span>Buat Berita / Event Resmi Baru</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs">
          {activeTab === 'curate' ? (
            <div className="space-y-4">
              {/* Pending reports */}
              <div>
                <h3 className="font-bold text-sm text-amber-400 mb-3 flex items-center gap-2">
                  <span>⏳ Laporan Menunggu Kurasi ({pendingReports.length})</span>
                </h3>

                {pendingReports.length === 0 ? (
                  <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-700/60 text-center text-slate-400">
                    <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                    <p className="font-bold text-slate-200">Semua laporan telah selesai dikurasi!</p>
                    <p className="text-[11px] mt-1">
                      Tidak ada laporan warga yang menunggu persetujuan saat ini.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingReports.map((report) => (
                      <div
                        key={report.id}
                        className="bg-slate-800/80 p-4 rounded-xl border border-amber-500/30 space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              {report.category}
                            </span>
                            <span className="text-slate-400 text-[11px]">
                              Pelapor: <strong className="text-slate-200">{report.reporterName}</strong>
                            </span>
                            <span className="text-slate-500 text-[10px]">
                              • {new Date(report.createdAt).toLocaleTimeString('id-ID')}
                            </span>
                          </div>

                          <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-red-950 text-red-300 border border-red-800">
                            Urgensi: {report.severity}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm text-white mb-1">{report.title}</h4>
                          <p className="text-slate-300 text-xs leading-relaxed">{report.description}</p>
                          <div className="mt-2 text-slate-400 flex items-center gap-1.5 text-[11px]">
                            <MapPin className="w-3.5 h-3.5 text-amber-400" />
                            <span>{report.address}</span>
                          </div>
                        </div>

                        {report.imageUrl && (
                          <div className="w-32 h-20 rounded-lg overflow-hidden border border-slate-700">
                            <img src={report.imageUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}

                        {/* Curator Input and Action Buttons */}
                        <div className="pt-2 border-t border-slate-700/60 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <input
                            type="text"
                            placeholder="Catatan petugas (opsional): misal 'Damkar sudah meluncur'..."
                            value={curatorNotes[report.id] || ''}
                            onChange={(e) =>
                              setCuratorNotes({ ...curatorNotes, [report.id]: e.target.value })
                            }
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                          />

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                onUpdateStatus(report.id, 'verified', curatorNotes[report.id])
                              }
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-1 transition shadow"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Verifikasi</span>
                            </button>

                            <button
                              onClick={() =>
                                onUpdateStatus(report.id, 'resolved', curatorNotes[report.id])
                              }
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg flex items-center gap-1 transition shadow"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Selesai</span>
                            </button>

                            <button
                              onClick={() =>
                                onUpdateStatus(report.id, 'rejected', curatorNotes[report.id])
                              }
                              className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white font-bold rounded-lg flex items-center gap-1 transition shadow"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Tolak</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Already curated reports */}
              <div className="pt-4 border-t border-slate-800">
                <h3 className="font-bold text-xs uppercase text-slate-400 mb-2">
                  Riwayat Laporan Yang Sudah Diproses ({otherReports.length})
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {otherReports.map((r) => (
                    <div
                      key={r.id}
                      className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between gap-2"
                    >
                      <div className="truncate flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            r.status === 'verified'
                              ? 'bg-emerald-400'
                              : r.status === 'resolved'
                              ? 'bg-blue-400'
                              : 'bg-red-400'
                          }`}
                        />
                        <span className="font-semibold text-slate-200 truncate">{r.title}</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 whitespace-nowrap">
                        {r.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Create News & Event Tab */
            <form onSubmit={handleSubmitNews} className="space-y-4">
              <div className="bg-amber-950/20 border border-amber-500/30 p-3 rounded-xl flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div className="text-[11px] text-amber-200">
                  <strong>Fitur Penulis Berita AI Gemini:</strong> Buat berita resmi dan agenda kota
                  Palembang langsung dari poin-poin singkat secara otomatis.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Judul Acara / Berita Resmi:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pawai Perahu Bidar & Festival Sriwijaya 2026"
                    value={newsTitle}
                    onChange={(e) => setNewsTitle(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Kategori Rilis:</label>
                  <select
                    value={newsCategory}
                    onChange={(e) => setNewsCategory(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="event">Agenda Event / Festival Kota</option>
                    <option value="lalulintas">Info Rekayasa Lalulintas / Penutupan Jalan</option>
                    <option value="lingkungan">Himbauan Lingkungan / Cuaca BMKG</option>
                    <option value="himbauan">Himbauan Kamtibmas Polrestabes</option>
                    <option value="darurat">Peringatan Kondisi Darurat</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Instansi Penanggung Jawab:</label>
                  <input
                    type="text"
                    placeholder="Contoh: Disbudpar Palembang / Polrestabes Palembang"
                    value={newsAgency}
                    onChange={(e) => setNewsAgency(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Lokasi di Palembang:</label>
                  <input
                    type="text"
                    placeholder="Contoh: Benteng Kuto Besak / Stadion JSC"
                    value={newsLocation}
                    onChange={(e) => setNewsLocation(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Bullet notes for AI generator */}
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-300">
                    Poin Penting / Catatan Kasar:
                  </label>
                  <button
                    type="button"
                    onClick={handleAiWriteNews}
                    disabled={isAiGenerating}
                    className="px-3 py-1 bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-slate-950 font-bold rounded-lg flex items-center gap-1 shadow transition text-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isAiGenerating ? 'AI Menulis...' : 'Generate Berita Lengkap AI'}</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  placeholder="Masukkan poin: tanggal pelaksanaan, pengalihan rute jalan, fasilitas yang disediakan, pesan walikota..."
                  value={newsNotes}
                  onChange={(e) => setNewsNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Summary */}
              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Ringkasan Berita (Tampil pada Peta & Notifikasi):
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ringkasan 1-2 kalimat..."
                  value={newsSummary}
                  onChange={(e) => setNewsSummary(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Full Content */}
              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Isi Lengkap Berita / Rilis Pers:
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Artikel lengkap..."
                  value={newsContent}
                  onChange={(e) => setNewsContent(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Image URL & Pin to map toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">URL Foto Sampul:</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newsImageUrl}
                    onChange={(e) => setNewsImageUrl(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-semibold">
                    <input
                      type="checkbox"
                      checked={pinOnMap}
                      onChange={(e) => setPinOnMap(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 bg-slate-800 border-slate-700 focus:ring-0"
                    />
                    <span>Sematkan langsung sebagai Pin Event di Peta Kota</span>
                  </label>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('curate')}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNews}
                  className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-lg transition flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmittingNews ? 'Menerbitkan...' : 'Terbitkan Berita Resmi'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
